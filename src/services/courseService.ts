// services/courseService.ts

import { Course } from "../models/Course";
import {
  CourseFilters,
  ScrapedCourse,
  SuggestedCourse as SuggCourse,
} from "../controllers/interfaces";
import { SuggestedCourse } from "../models/SuggestedCourse";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import {
  CommaSeparatedListOutputParser,
  JsonOutputFunctionsParser,
} from "langchain/output_parsers";
import { HumanMessage } from "@langchain/core/messages";
import puppeteer from 'puppeteer-extra';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { htmlToText } from "html-to-text";
import { Document } from "@langchain/core/documents";
import { AppDataSource } from "../data-source";
import { Platform } from "../models/Platform";
import { LessThanOrEqual, Repository } from "typeorm";
import { Level } from "../models/Level";
import { Category } from "../models/Category";
import { getPlatformArray } from "./platformService";
import { getCategoryArray } from "./categoryService";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { link } from "fs";
import * as dollarUtils from "../utils/dollar.utils";

const { leven } = require("@nlpjs/similarity");

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
          description: "Nombre del módulo",
        },
        description: {
          type: "string",
          description: "Descripción breve del curso",
        },
        duration: {
          type: "number",
          description: "Duración del curso en semanas",
        },
        level: {
          type: "string",
          enum: ["principiante", "intermedio", "avanzado"],
          description: "Dificultad del curso",
        },
        cost: {
          type: "number",
          description:
            "Costo del curso solo en números. Solo insertar si el costo está en pesos argentinos. En caso contrario insertar el valor 0",
        },
        platform: {
          type: "string",
          enum: platformArray,
          description: "Plataforma donde se imparte el curso",
        },
        category: {
          type: "string",
          enum: categoryArray,
          description: "Categoría donde se imparte el curso",
        },
        url: {
          type: "string",
          description: "URL del curso",
        },
      },
    },
  };

  return scrapedCourseSchema;
};

export const getSuggestedCourseSchema = async (): Promise<any> => {
  const suggestedCourseSchema = {
    name: "data",
    description: "Muestra un listado de cursos para la descripcion dada.",
    parameters: {
      type: "object",
      properties: {
        courses: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Nombre del módulo",
              },
              platform: {
                type: "string",
                description: "Plataforma donde se imparte el curso",
              },
              url: {
                type: "string",
                description: "URL del curso",
              },
            },
          },
          description: "Lista de cursos",
        },
      },
    },
  };

  return suggestedCourseSchema;
};

export const filterByKeywords = (
  keywords: string[],
  courses: Course[]
): Course[] => {
  const filteredCourses: Course[] = [];
  keywords = keywords.map((k) =>
    k
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  );

  courses.forEach(function (course) {
    const nameWords: string[] = course.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .split(" ")
      .concat();
    const descriptionWords: string[] = course.description
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .split(" ");
    const words: string[] = nameWords.concat(descriptionWords);

    wordsLoop: for (let i = 0; i < words.length; i++) {
      for (let j = 0; j < keywords.length; j++) {
        if (leven(keywords[j], words[i]) <= 3) {
          console.log(
            keywords[j] + " " + words[i] + " " + leven(keywords[j], words[i])
          );
          filteredCourses.push(course);
          break wordsLoop;
        }
      }
    }
  });

  return filteredCourses;
};

const searchAndExtractLinks = async (query: string): Promise<string[]> => {
  puppeteer.use(AdblockerPlugin()).use(StealthPlugin())

  // Lanza el navegador
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.mouse.move(100, 200); await page.mouse.move(150, 250, { steps: 10 }); await page.keyboard.type('Hello World', { delay: 100 });


  // Navega a Google y busca el término
  await page.goto(
    `https://www.bing.com/search?q=${encodeURIComponent("curso de " + query)}`, { waitUntil: 'networkidle2' }
  );

  // Espera a que los resultados carguen y extrae los enlaces
  await page.waitForSelector("a");
  const links = await page.$$eval("a", (as) => as.map((a) => a.href));

  // Filtra los enlaces que sean relevantes (por ejemplo, contienen "curso")
  const courseLinks = links.filter(
    (link) =>
      link != "" &&
      !link.toLowerCase().includes("google") &&
      !link.toLowerCase().includes("youtube") &&
      !link.toLowerCase().includes("stackoverflow")
  );
  browser.close();

  return courseLinks;
};

const getRefinedLinks = async (input: string): Promise<string[]> => {
  console.time("t1");
  const links: string[] = await searchAndExtractLinks(input);
  console.timeEnd("t1");
  const prompt: string = `Refinar, filtrar y listar los links más relevantes de ${links.join(
    ", "
  )}.\n{format_instructions}`;

  // instanciar el parser
  const parser = new CommaSeparatedListOutputParser();

  const chain = RunnableSequence.from([
    PromptTemplate.fromTemplate(prompt),
    new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 }),
    parser,
  ]);

  console.time("t2");
  const response = await chain.invoke({
    subject: "links de cursos digitales",
    format_instructions: parser.getFormatInstructions(),
  });
  console.timeEnd("t2");

  return response;
};

const getScrapedCourse = async (link: string): Promise<ScrapedCourse> => {
  const loader = new PuppeteerWebBaseLoader(link, {
    launchOptions: {
      executablePath: "/usr/bin/google-chrome",
      headless: true,
      args: ["--no-sandbox"],
    },
  });

  const docs = await loader.load();
  const text = htmlToText(docs[0].pageContent, {
    baseElements: {
      selectors: ["body"],
    },
  });
  const document = new Document({
    pageContent: text,
    metadata: { ...docs[0].metadata },
  });

  const prompt = `Aqui tienes el contenido de una página web de un curso: ${document.pageContent}.
            Su correspondiente URL es: ${document.metadata.source} Extraer la información más relevante.`;

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
};

const saveScrapedcourse = async (
  scrapedCourse: ScrapedCourse,
  getPlatformId: (name: string | undefined) => number | undefined,
  getLevelId: (name: string | undefined) => number | undefined,
  getCategoryId: (name: string | undefined) => number | undefined,
  dollarValue?: number
): Promise<void> => {
  const courseRepository = AppDataSource.getRepository(Course);
  const course: Course | null = await courseRepository.findOne({
    select: {
      url: true,
    },
    where: {
      url: scrapedCourse.url,
    },
  });

  const courses = [];

  if (!course) {
    const newCourse: any = {
      name: scrapedCourse.name ?? undefined,
      description: scrapedCourse.description ?? undefined,
      duration: scrapedCourse.duration ?? undefined,
      idlevel: getLevelId(scrapedCourse.level),
      cost: scrapedCourse.cost ?? undefined,
      idplatform: getPlatformId(scrapedCourse.platform),
      idcategory: getCategoryId(scrapedCourse.category),
      url: scrapedCourse.url ?? undefined,
    };
    if (scrapedCourse.cost && dollarValue) {
      newCourse.dollarcost = scrapedCourse.cost / dollarValue;
    }
    await courseRepository.save(newCourse);
    courses.push(scrapedCourse);
  }
};

export const scrapeCourses = async (
  input: string
): Promise<ScrapedCourse[]> => {
  const scrapedCourses: ScrapedCourse[] = [];
  const links: string[] = await getRefinedLinks(input);
  const platformRepo: Repository<Platform> =
    AppDataSource.getRepository(Platform);
  const allPlatforms: Platform[] = await platformRepo.find({
    select: {
      idplatform: true,
      name: true,
    },
  });
  const levelRepo: Repository<Level> = AppDataSource.getRepository(Level);
  const allLevels: Level[] = await levelRepo.find({
    select: {
      idlevel: true,
      description: true,
    },
  });
  const categoryRepo: Repository<Category> =
    AppDataSource.getRepository(Category);
  const allCategories: Category[] = await categoryRepo.find({
    select: {
      idcategory: true,
      name: true,
    },
  });

  const getPlatformId = (name: string | undefined): number | undefined => {
    const platform = allPlatforms.find((platform) => platform.name == name);
    return platform?.idplatform;
  };
  const getLevelId = (name: string | undefined): number | undefined => {
    const level = allLevels.find((level) => level.description == name);
    return level?.idlevel;
  };
  const getCategoryId = (name: string | undefined): number | undefined => {
    const category = allCategories.find((category) => category.name == name);
    return category?.idcategory;
  };

  for (let link of links) {
    try {
      const result: ScrapedCourse = await getScrapedCourse(link);
      const dollarValue: number = await dollarUtils.getCurrentDollarValue();
      if (result.name && result.url) {
        saveScrapedcourse(
          result,
          getPlatformId,
          getLevelId,
          getCategoryId,
          dollarValue
        );
        scrapedCourses.push(result);
      }
    } catch (e) {
      console.log(e);
    }
  }

  return scrapedCourses;
};

export const coursesByFilters = async (
  data: CourseFilters
): Promise<Course[] | SuggCourse[]> => {
  try {
    const { input, idcategory, idlevel, duration, cost } = data;

    const courseRepository: Repository<Course> =
      AppDataSource.getRepository(Course);
    let courses: Course[] = await courseRepository.find({
      select: {
        name: true,
        description: true,
        duration: true,
        cost: true,
        url: true,
        priority: true,
        dollarcost: true,
        category: {
          name: true,
          description: true,
        },
        level: {
          description: true,
        },
        platform: {
          name: true,
          description: true,
        },
      },
      where: {
        idcategory: idcategory,
        idlevel: idlevel,
        duration: duration && LessThanOrEqual(duration),
        cost: cost && LessThanOrEqual(cost),
      },
      relations: {
        category: true,
        platform: true,
        level: true,
      },
    });

    if (input && courses.length > 0) {
      if (input) {
        const docs: Document[] = [];
        for (let course of courses) {
          course.description &&
            course.name &&
            docs.push(
              new Document({
                pageContent: `Nombre: ${course.name}, Descripcion: ${course.description}`,
                metadata: course,
              })
            );
        }

        const vectorStore = await HNSWLib.fromDocuments(
          docs,
          new OpenAIEmbeddings({ model: "text-embedding-3-small" })
        );
        const filteredDocs = await vectorStore.similaritySearchWithScore(
          input,
          10
        );

        courses = filteredDocs
          .filter((doc) => doc[1] <= 0.6)
          .map((doc) => doc[0].metadata) as Course[];

        if (courses.length === 0) {
          const suggestedCourses: SuggCourse[] = await suggestCourses(input);
          return suggestedCourses;
        }
      }
    } else {
      if (input) {
        const suggestedCourses: SuggCourse[] = await suggestCourses(input);
        return suggestedCourses;
      }
    }

    return courses;
  } catch (error) {
    throw error;
  }
};

export const suggestCourses = async (input: string): Promise<SuggCourse[]> => {
  let links: string[] = await searchAndExtractLinks(input);
  if (links.length > 8) {
    links = links.slice(0, 8);
  }

  const prompt = `Aqui tienes URLs de páginas web de cursos: ${links}.
    Refinar y extraer la información más relevante.`;

  // instanciar el parser
  const parser = new JsonOutputFunctionsParser();

  // instanciar la clase ChatOpenAI
  const model = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

  // crear un runnable, asociar la function que define el esquema JSON al modelo
  // y suministrar la salida al parser a traves de un pipe
  const runnable = model
    .bind({
      functions: [await getSuggestedCourseSchema()],
      function_call: { name: "data" },
    })
    .pipe(parser);

  // se invoca el runnable con la entrada
  const result: any = await runnable.invoke([new HumanMessage(prompt)]);

  const suggCourseRepo = AppDataSource.getRepository(SuggestedCourse);
  const allCourses = await suggCourseRepo.find({
    select: { url: true },
  });

  for (let course of result.courses as SuggCourse[]) {
    try {
      if (!allCourses.some((c) => c.url === course.url)) {
        suggCourseRepo.save(course);
      }
    } catch (error: any) {
      console.log("Ya existe el curso con url: " + course.url);
    }
  }

  return result.courses as SuggCourse[];
};

export const updateDollarCost = async (): Promise<void> => {
  const courseRepository = AppDataSource.getRepository(Course);
  const value: number = await dollarUtils.getCurrentDollarValue();
  const courses = await courseRepository.find();

  for (let course of courses) {
    course.dollarvalue = value;
    course.dollarcost = course.cost / value;
    await courseRepository.save(course);
  }
};
