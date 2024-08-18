// services/learningPathService.ts

import { LearningPathAiResponse } from "../controllers/interfaces";
import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { HumanMessage } from "@langchain/core/messages";


export const invokeRunnable = async (input: string): Promise<LearningPathAiResponse> => {
    // instanciar el parser
    const parser = new JsonOutputFunctionsParser();

    // instanciar la clase ChatOpenAI
    const model = new ChatOpenAI({ model: "gpt-4o-mini" });

    // crear un runnable, asociar la function que define el esquema JSON al modelo
    // y suministrar la salida al parser a traves de un pipe
    const runnable = model
        .bind({
            functions: [learningPathSchema],
            function_call: { name: "learning_path" },
        })
        .pipe(parser);

    // se invoca el runnable con la entrada
    const result: LearningPathAiResponse = await runnable.invoke([
        new HumanMessage(input),
    ]);

    return result;
};

export const learningPathSchema = {
    name: "learning_path",
    description: "Muestra un listado de módulos para la hoja de ruta.",
    parameters: {
        type: "object",
        properties: {
            lista_modulos: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        order: {
                            type: "number",
                            description: "Orden en que debe realizarse el módulo"
                        },
                        title: {
                            type: "string",
                            description: "Titulo del módulo"
                        },
                        description: {
                            type: "string",
                            description: "Descripcion del módulo"
                        }
                    }
                },
                description: "Lista de módulos",
            }
        }
    },
};