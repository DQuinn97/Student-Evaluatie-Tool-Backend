# Node, Express and TypeScript Project Template

Welcome to the **Node, Express and TypeScript Project Template**! This repository serves as a starter template for building Node.js applications with TypeScript. It comes pre-configured with models, controllers, routes, and bundling, so you can focus on building your application.

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
│   │   └── exampleController.ts
│   ├── middleware
│   │   └── exampleMiddleware.ts
│   ├── models
│   │   └── exampleModel.ts
│   ├── routes
│   │   └── exampleRoutes.ts
│   └── server.ts    // Main entry point of the application
├── dist             // Compiled output (auto-generated)
├── package.json     // Project dependencies and scripts
├──.gitignore        // Ignore files to github
├── tsconfig.json    // TypeScript configuration
└── README.md        // Project documentation
```

## Getting Started

### 1. Start Development Server

Run the development server with hot-reloading:

```bash
npm run dev
```

### 2. Build the Project

Compile TypeScript files to JavaScript:

```bash
npm run build
```

### 3. Start the Production Server

After building the project, start the server:

```bash
npm start
```

## Scripts

- `dev`: Starts the development server with hot-reloading.
- `build`: Compiles the TypeScript source code to JavaScript.
- `start`: Starts the production server.

## License

This project is licensed under the [MIT License](LICENSE).

---

Happy coding! 🎉
