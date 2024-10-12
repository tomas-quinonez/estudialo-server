// services/courseService.ts

import { Course } from "../models/Course";
import { ScrapedCourse } from "../controllers/interfaces";
import { ChatOpenAI } from "@langchain/openai";
import { CommaSeparatedListOutputParser, JsonOutputFunctionsParser } from "langchain/output_parsers";
import { HumanMessage } from "@langchain/core/messages";
import puppeteer from "puppeteer";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { htmlToText } from "html-to-text";
import { Document } from "@langchain/core/documents";
import { AppDataSource } from "../data-source";
import { Platform } from "../models/Platform";
import { Repository } from "typeorm";
import { Level } from "../models/Level";
import { Category } from "../models/Category";
import { getPlatformArray } from "./platformService";
import { getCategoryArray } from "./categoryService";

const { leven } = require('@nlpjs/similarity');


export const getScrapedCourseSchema = async (): Promise<any> => {
  const platformArray: string[] = await getPlatformArray();
  const categoryArray: string[] = await getCategoryArray();

  const scrapedCourseSchema = {
    name: "data",
    description: "Muestra un listado de cursos para la descripcion dada.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Nombre del módulo"
        },
        description: {
          type: "string",
          description: "Descripción breve del curso"
        },
        duration: {
          type: "number",
          description: "Duración del curso en semanas"
        },
        level: {
          type: "string",
          enum: ['principiante', 'intermedio', 'avanzado'],
          description: "Dificultad del curso"
        },
        cost: {
          type: "number",
          description: "Costo del curso solo en números"
        },
        platform: {
          type: "string",
          enum: platformArray,
          description: "Plataforma donde se imparte el curso"
        },
        category: {
          type: "string",
          enum: categoryArray,
          description: "Categoría donde se imparte el curso"
        },
        url: {
          type: "string",
          description: "URL del curso"
        },
      }
    }
  };

  return scrapedCourseSchema;
}

export const filterByKeywords = (keywords: string[], courses: Course[]): Course[] => {
  const filteredCourses: Course[] = [];
  keywords = keywords.map(k => k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

  courses.forEach(function (course) {
    const nameWords: string[] = course.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(' ').concat();
    const descriptionWords: string[] = course.description.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(' ');
    const words: string[] = nameWords.concat(descriptionWords);

    wordsLoop:
    for (let i = 0; i < words.length; i++) {
      for (let j = 0; j < keywords.length; j++) {
        if (leven(keywords[j], words[i]) <= 3) {
          console.log(keywords[j] + ' ' + words[i] + ' ' + leven(keywords[j], words[i]));
          filteredCourses.push(course);
          break wordsLoop;
        }
      }
    }
  });

  return filteredCourses;
}

const searchAndExtractLinks = async (query: string): Promise<string[]> => {
  // Lanza el navegador
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  // Navega a Google y busca el término
  await page.goto(`https://www.google.com/search?q=${encodeURIComponent("curso de " + query)}`);

  // Espera a que los resultados carguen y extrae los enlaces
  await page.waitForSelector('a');
  const links = await page.$$eval('a', as => as.map(a => a.href));

  // Filtra los enlaces que sean relevantes (por ejemplo, contienen "curso")
  const courseLinks = links.filter(link => link != ''
    && !link.toLowerCase().includes('google')
    && !link.toLowerCase().includes('youtube')
    && !link.toLowerCase().includes('stackoverflow'));

  await browser.close();

  return courseLinks;
}

const getRefinedLinks = async (input: string): Promise<string[]> => {
  const links: string[] = await searchAndExtractLinks(input);
  const prompt: string = `Refinar, filtrar y listar los links más relevantes de ${links.join(', ')}.\n{format_instructions}`

  // instanciar el parser
  const parser = new CommaSeparatedListOutputParser();

  const chain = RunnableSequence.from([
    PromptTemplate.fromTemplate(prompt),
    new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 }),
    parser,
  ]);

  const response = await chain.invoke({
    subject: "links de cursos digitales",
    format_instructions: parser.getFormatInstructions(),
  });

  return response;
}

const getScrapedCourse = async (link: string): Promise<ScrapedCourse> => {
  const loader = new PuppeteerWebBaseLoader(link, {
    launchOptions: {
      executablePath: '/usr/bin/google-chrome',
      headless: true,
      args: ['--no-sandbox']
    },
  });

  const docs = await loader.load();
  const text = htmlToText(docs[0].pageContent, {
    baseElements: {
      selectors: ['body']
    }
  });
  const document = new Document({
    pageContent: text,
    metadata: { ...docs[0].metadata }
  });

  const prompt = `Aqui tienes el contenido de una página web de un curso: ${document.pageContent}.
            Su correspondiente URL es: ${document.metadata.source} Extraer la información más relevante.`

  // instanciar el parser
  const parser = new JsonOutputFunctionsParser();

  // instanciar la clase ChatOpenAI
  const model = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

  // crear un runnable, asociar la function que define el esquema JSON al modelo
  // y suministrar la salida al parser a traves de un pipe
  const runnable = model
    .bind({
      functions: [await getScrapedCourseSchema()],
      function_call: { name: "data" },
    })
    .pipe(parser);

  // se invoca el runnable con la entrada
  const result: ScrapedCourse = await runnable.invoke([
    new HumanMessage(prompt),
  ]);

  return result;
}

const saveScrapedcourse = async (
  scrapedCourse: ScrapedCourse,
  getPlatformId: (name: string | undefined) => number | undefined,
  getLevelId: (name: string | undefined) => number | undefined,
  getCategoryId: (name: string | undefined) => number | undefined): Promise<void> => {

  const courseRepository = AppDataSource.getRepository(Course);
  const course: Course | null = await courseRepository.findOne({
    select: {
      url: true,
    },
    where: {
      url: scrapedCourse.url
    }
  });

  const courses = [];

  if (!course) {
    const newCourse = {
      name: scrapedCourse.name ?? undefined,
      description: scrapedCourse.description ?? undefined,
      duration: scrapedCourse.duration ?? undefined,
      idlevel: getLevelId(scrapedCourse.level),
      cost: scrapedCourse.cost ?? undefined,
      idplatform: getPlatformId(scrapedCourse.platform),
      idcategory: getCategoryId(scrapedCourse.category),
      url: scrapedCourse.url ?? undefined
    }
    await courseRepository.save(newCourse);
    courses.push(scrapedCourse)
  }
}

export const scrapeCourses = async (input: string): Promise<ScrapedCourse[]> => {
  const scrapedCourses: ScrapedCourse[] = [];
  const links: string[] = await getRefinedLinks(input);
  const platformRepo: Repository<Platform> = AppDataSource.getRepository(Platform);
  const allPlatforms: Platform[] = await platformRepo.find({
    select: {
      idplatform: true,
      name: true
    }
  })
  const levelRepo: Repository<Level> = AppDataSource.getRepository(Level);
  const allLevels: Level[] = await levelRepo.find({
    select: {
      idlevel: true,
      description: true
    }
  })
  const categoryRepo: Repository<Category> = AppDataSource.getRepository(Category);
  const allCategories: Category[] = await categoryRepo.find({
    select: {
      idcategory: true,
      name: true
    }
  })

  const getPlatformId = (name: string | undefined): number | undefined => {
    const platform = allPlatforms.find(platform => platform.name == name)
    return platform?.idplatform;
  }
  const getLevelId = (name: string | undefined): number | undefined => {
    const level = allLevels.find(level => level.description == name)
    return level?.idlevel;
  }
  const getCategoryId = (name: string | undefined): number | undefined => {
    const category = allCategories.find(category => category.name == name)
    return category?.idcategory;
  }

  for (let link of links) {
    try {
      const result: ScrapedCourse = await getScrapedCourse(link);
      if (result.name && result.url) {
        saveScrapedcourse(result, getPlatformId, getLevelId, getCategoryId);
        scrapedCourses.push(result)
      }
    } catch (e) {
      console.log(e);
    }
  }

  return scrapedCourses;
}