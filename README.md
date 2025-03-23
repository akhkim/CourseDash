# CourseDash

## Table of Contents

- [Inspiration](#inspiration)
- [Role](#role)
- [Purpose](#purpose)
- [Challenges](#challenges)
- [Accomplishments](#accomplishments)
- [Lessons](#lessons)
- [Future Plans](#future-plans)
- [License](#license)

## Inspiration
As a dedicated university student, I learned the difficulties of managing a crowded academic calendar by experience. Between lectures, office hours, tutorials, clubs, assignments, and exams, keeping everything organized and fully comprehended was a constant struggle. CourseDash emerged out of necessity for an intelligent, streamlined solution that not only handles your academic calendar but also augments your learning experience through AI-driven insights. We wanted to make something that would fill the gap between understanding and administration—a true study buddy.

## Role
CourseDash is an AI-powered study assistant that revolutionizes how you manage your academic life. It offers endless academic features including:
- Automated Scheduling: Seamlessly adds lectures, office hours, tutorials, and test schedules to your Google Calendar.
- AI-Generated Summaries: Delivers concise, informative summaries for each lecture, helping you review key points quickly.
- Practice Quizzes & Tests: Generates customized quizzes and practice tests based on past exam data to prepare you effectively.
- Course-Specific Chatbot Assistant: Features a dedicated chatbot that is fully informed about your course syllabus and lectures, ready to answer your questions and clarify concepts in real time.

## Purpose
Our tech-stack looks like the following 
- Languages & Frameworks: Developed primarily in TypeScript and Python through Flask and Next.js. Through this approach, we were able to utilize modern web frameworks to build a responsive and intuitive interface, while using Python's robustness for AI related tasks.
- APIs & Cloud Services: We used Google's Gemini as the base model for our course-specific assistants, and used Firebase for Google OAuth 2.0, and Google Workspace to automatically add the events to the user's Google Calendar.
- AI Integration: Leveraged off of Google's Gemini to automatically add lectures, office hours, tutorials, and test schedules to your Google Calendar when the syllabus is provided. Furthermore, the model generates lecture summaries, quizzes, and interactive chatbot responses according to the lecture notes that you provide, allowing for the most accurate and relevant information.
- Collaborative Development: We adopted agile methodologies, with continuous integration and real-time collaboration using version control and project management tools, ensuring rapid development over the 36 hours.

## Challenges
As amazing as the results are, these results came at a cost of several challenges.

The biggest challenge that we faced was that no one in our group had previous experience with Flask, and were not too familiar with TypeScript. Despite us not being familiar with the languages, we thought Flask and TypeScript has the biggest potential, so we ambitiously started coding in those languages, which did not turn out as positively as we expected. However, we were able to eventually grow accustomed to these languages and successfully finish the project, making this hackathon not only a great opportunity to show off our skills, but also learn new languages through experience. 

Another remarkable challenge that we faced was that we decided to rebase from Vite to Next.js, as we realized that making API calls and bridging between languages was more fluid and intuitive to us. Migrating from a purely client-side setup to a full-stack framework required us to refactor our codebase entirely, particularly in handling routing, imports, and API endpoints. Despite these challenges, the shift ultimately streamlined our development workflow, enhanced performance, and provided a more scalable foundation for our application.

## Accomplishments
- Seamless User Experience: We successfully designed and implemented a clean, intuitive, and professional UI, ensuring that students can interact with CourseDash effortlessly. Also, our interface is responsive and mobile-friendly, making CourseDash accessible anytime, anywhere. Additionally, we focused on intelligent automation, reducing manual input for users. By automatically syncing with Google Calendar, CourseDash eliminates the tedious task of manually adding events, freeing students to focus on learning rather than logistics. The interface is designed to reduce cognitive load, presenting only the most relevant information at the right time through a streamlined dashboard.

- Robust AI Functionality: At the heart of CourseDash is its AI-powered learning assistant, which delivers impressive accuracy in both lecture summarization and chatbot responses. Our course-specific chatbot assistant stands out as one of the most innovative features. Unlike generic AI chatbots, it is informed about the syllabus, lectures, and course materials, enabling it to provide context-aware, precise answers. The chatbot can not only clarify lecture content, but provide additional explanations based on the syllabus, and suggest relevant practice questions.This personalized AI assistant makes learning more interactive and accessible, reducing the need for frantic late-night Google searches or waiting for instructor responses.

- End-to-End Integration: One of the biggest technical achievements was bringing together multiple AI-powered learning tools into one unified platform. Rather than just being a calendar manager or a study resource, CourseDash seamlessly integrates scheduling, lecture summarization, AI-driven practice tools, and chatbot assistance into a cohesive, all-in-one academic assistant.

## Lessons
Throughout GenAI Genesis and the 36 hours we spent on CourseDash, a piece of knowledge we have learned was how to use Flask and TypeScript, given that those languages are used commonly in hackathons, and we will eventually get an opportunity to use the knowledge we learned today at another hackathon. However, the importance of this knowledge is miniscule compared to the joy of working on a project alongside friends. Spending 36 hours coding on one project with friends has reinforced our passion and joy for coding, and every group member unanimously wanted to continue building this project even after the end of the hackathon, which we think is a more valuable outcome than anything.
 
## Future Plans
