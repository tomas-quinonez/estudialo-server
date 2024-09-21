// services/courseService.ts

import { Course } from "../models/Course";
import { CoursesAiResponse } from "../controllers/interfaces";
import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { HumanMessage } from "@langchain/core/messages";
import puppeteer from "puppeteer";
const { leven } = require('@nlpjs/similarity');


export const courseSchema = {
    name: "courses",
    description: "Muestra un listado de cursos para la descripcion dada.",
    parameters: {
        type: "object",
        properties: {
            courses: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        id: {
                            type: "number",
                            description: "Un id único dentro de la lista"
                        },
                        name: {
                            type: "string",
                            description: "Nombre del módulo"
                        },
                        platform: {
                            type: "string",
                            description: "Plataforma donde se imparte el curso"
                        },
                        url: {
                            type: "string",
                            description: "URL del curso"
                        },
                    }
                },
                description: "Lista de cursos",
            }
        }
    },
};

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
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);

    // Espera a que los resultados carguen y extrae los enlaces
    await page.waitForSelector('a');
    const links = await page.$$eval('a', as => as.map(a => a.href));

    // Filtra los enlaces que sean relevantes (por ejemplo, contienen "curso")
    const courseLinks = links.filter(link => link.toLowerCase().includes('curso'));

    await browser.close();

    return courseLinks;
}

export const invokeRunnable = async (input: string): Promise<CoursesAiResponse> => {
    const links = await searchAndExtractLinks(input);
    const prompt = `Aquí hay links extraídos de una búsqueda: ${links.join(', ')}. Por favor refinar y extraer los cursos más relevantes.`

    // instanciar el parser
    const parser = new JsonOutputFunctionsParser();

    // instanciar la clase ChatOpenAI
    const model = new ChatOpenAI({ model: "gpt-4o-mini" });

    // crear un runnable, asociar la function que define el esquema JSON al modelo
    // y suministrar la salida al parser a traves de un pipe
    const runnable = model
        .bind({
            functions: [courseSchema],
            function_call: { name: "courses" },
        })
        .pipe(parser);

    // se invoca el runnable con la entrada
    const result: CoursesAiResponse = await runnable.invoke([
        new HumanMessage(prompt),
    ]);

    return result;
}