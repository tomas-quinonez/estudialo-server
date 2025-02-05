import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { check } from "express-validator";

export const validateLearningPathInput = [
  check("input")
    .exists()
    .withMessage("")
    .isString()
    .withMessage("La entrada debe ser un texto")
    .escape()
    .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ.#!$\d\s]+$/)
    .withMessage("Solo se permiten caracteres, números y #, !, $, .")
    .isLength({ max: 30 })
    .withMessage("La entrada debe ser menor a 30 caracteres"),
];

export async function validateInputContent(input: string): Promise<string> {
  const model = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

  const promptTemplate = ChatPromptTemplate.fromTemplate(
    `
    Debes determinar si la siguiente entrada corresponde con una solicitud del usuario sobre algún curso, taller \
    posgrado, etc. (cualquier cosa relacionada a formación académica) de cualquier tópico. Simplemente debes \
    responder son "si" o con "no".

    Ejemplos:

    Pregunta: Quiero aprender sobre programación.
    si

    Pregunta: sadsasakjsdksdkj
    no

    Pregunta: Dime el clima para hoy
    no

    Pregunta: Cursos de cocina
    si

    Input:
    {input}
    `
  );

  const chain = promptTemplate.pipe(model);
  const result = await chain.invoke({ input });

  return result.content.toString();
}
