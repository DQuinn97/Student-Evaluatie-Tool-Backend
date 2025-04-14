# Student Evaluatie Tool

Deze tool dient als vervangende stageopdracht voor de opleiding Full Stack Developer in naam van Syntra. Dit project is ontwikkeld door [Matti](https://github.com/MattiVboiii) en [Quinten](https://github.com/DQuinn97). Deze repo is de backend, de frontend is te vinden op [Student-Evaluatie-Tool](https://github.com/DQuinn97/Student-Evaluatie-Tool).

Deze applicatie biedt docenten en studenten een gebruiksvriendelijk platform om het beheer van taken en toetsen efficiënter te maken. Met een moderne technologie-stack en een goed gestructureerd backend-systeem zorgt de applicatie voor een naadloze ervaring voor beide gebruikersgroepen. De toevoeging van het stagedagboek stelt studenten in staat om hun stage-ervaringen te documenteren en eenvoudig een overzichtelijke PDF te genereren.

## Features

- **TypeScript**: Strongly typed language for writing robust and maintainable code.
- **Project Structure**: Organized folder structure with models, controllers, and routes.
- **Bundling pkgroll**: Pre-configured with a bundler for efficient builds.
- **TSX**: For automatic server restarts an running typescript during development.
- **Dependency Management**: Configured with npm.

## Project Structure

```
├── src
│   ├── controllers
│   │   ├── authController.ts
│   │   ├── bijlageController.ts
│   │   ├── dumpController.ts
│   │   ├── gebruikerController.ts
│   │   ├── graderingController.ts
│   │   ├── klasgroepController.ts
│   │   ├── notFoundController.ts
│   │   ├── stagedagboekController.ts
│   │   └── taakController.ts
│   ├── middleware
│   │   ├── authMiddleware.ts
│   │   ├── loggerMiddleware.ts
│   │   ├── multerMiddleware.ts
│   │   └── uniqueMiddleware.ts
│   ├── models
│   │   ├── BijlageModel.ts
│   │   ├── GebruikerModel.ts
│   │   ├── GraderingModel.ts
│   │   ├── InzendingModel.ts
│   │   ├── KlasgroepModel.ts
│   │   ├── StagedagboekModel.ts
│   │   ├── StagedagModel.ts
│   │   ├── StageverslagModel.ts
│   │   ├── TaakModel.ts
│   │   └── VakModel.ts
│   ├── routes
│   │   ├── authRoutes.ts
│   │   ├── bijlageRoutes.ts
│   │   ├── gebruikerRoutes.ts
│   │   ├── graderingRoutes.ts
│   │   ├── inzendingRoutes.ts
│   │   ├── klasgroepRoutes.ts
│   │   ├── stagedagboekRoutes.ts
│   │   └── taakRoutes.ts
│   ├── server.ts    // Main entry point of the application
│   └── swagger.ts   // Swagger JSDocs configuration
├── .env             // Environment variables (not in git repo)
├── dist             // Compiled output (auto-generated)
├── package.json     // Project dependencies and scripts
├──.gitignore        // Ignore files to github
├── tsconfig.json    // TypeScript configuration
└── README.md        // Project documentation
```

## scripts

- `npm run dev`: Starts the development server with hot-reloading.
- `npm run build`: Compiles the TypeScript source code to JavaScript.
- `npm start`: Starts the production server.
