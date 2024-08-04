import { Course } from "../models/Course";
const { leven } = require('@nlpjs/similarity');


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