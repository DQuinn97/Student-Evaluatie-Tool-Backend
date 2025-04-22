import swaggerJsdoc from "swagger-jsdoc";
const isProduction = process.env.NODE_ENV === "production";
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Student Evaluatie Tool API",
      version: "1.2.0",
      description:
        "API documentatie voor de Student Evaluatie Tool, ontworpen voor Syntra AB - 2025",
    },
    externalDocs: {
      description: "Project informatie op Git repo",
      url: "https://github.com/DQuinn97/Student-Evaluatie-Tool-Backend",
    },
    servers: isProduction
      ? [
          {
            url: "https://student-evaluatie-tool.onrender.com/api",
            description: "Production server",
          },
        ]
      : [
          {
            url: "http://localhost:3000/api",
            description: "Development server",
          },
          {
            url: "https://student-evaluatie-tool.onrender.com/api",
            description: "Production server",
          },
        ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
      schemas: {
        Gebruiker: {
          type: "object",
          required: ["email", "wachtwoord"],
          properties: {
            _id: {
              type: "string",
              example: "gebruikerId",
            },
            naam: {
              type: "string",
              example: "John",
            },
            achternaam: {
              type: "string",
              example: "Doe",
            },
            email: {
              type: "string",
              example: "example@mail.com",
            },
            gsm: {
              type: "string",
              example: "0412345678",
            },
            isDocent: {
              type: "boolean",
              default: false,
            },
            foto: {
              type: "string",
              example:
                "http://res.cloudinary.com/dqcloud/image/upload/profielen/profiel-00000000000000",
            },
          },
        },
        Klasgroep: {
          type: "object",
          required: ["naam", "beginjaar", "eindjaar"],
          properties: {
            _id: {
              type: "string",
              example: "klasgroepId",
            },
            naam: {
              type: "string",
              example: "Full Stack",
            },
            beginjaar: {
              type: "number",
              minimum: new Date().getFullYear() - 2,
              maximum: new Date().getFullYear() + 5,
              example: new Date().getFullYear(),
            },
            eindjaar: {
              type: "number",
              minimum: new Date().getFullYear() - 2,
              maximum: new Date().getFullYear() + 5,
              example: new Date().getFullYear() + 1,
            },
            studenten: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Gebruiker",
              },
              uniqueItems: true,
            },
            vakken: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Vak",
              },
              uniqueItems: true,
            },
          },
        },
        Vak: {
          type: "object",
          required: ["naam"],
          properties: {
            _id: {
              type: "string",
              example: "vakId",
            },
            naam: {
              type: "string",
              example: "Javascript",
            },
          },
        },
        Taak: {
          type: "object",
          required: ["titel", "beschrijving", "deadline", "weging"],
          properties: {
            _id: {
              type: "string",
              example: "taakId",
            },
            type: {
              type: "string",
              enum: ["taak", "test"],
              default: "taak",
            },
            titel: {
              type: "string",
              example: "React Todo-app",
            },
            beschrijving: {
              type: "string",
              example:
                "Maak nog maar eens een todo app met een nieuw framework",
            },
            deadline: {
              type: "string",
              format: "date",
              example: new Date(),
            },
            weging: {
              type: "number",
              example: 0.2,
            },
            maxScore: {
              type: "number",
              example: 100,
            },
            isGepubliceerd: {
              type: "boolean",
              default: false,
            },
            vak: {
              $ref: "#/components/schemas/Vak",
            },
            bijlagen: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Bijlage",
              },
              uniqueItems: true,
            },
            inzendingen: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Inzending",
              },
              uniqueItems: true,
            },
          },
        },
        Inzending: {
          type: "object",
          required: ["git", "live", "beschrijving", "student"],
          properties: {
            _id: {
              type: "string",
              example: "inzendingId",
            },
            git: {
              type: "string",
              example: "github.com/gebruiker/repo",
            },
            live: {
              type: "string",
              example: "todo-app-van-gebruiker.surge.sh",
            },
            beschrijving: {
              type: "string",
              example: " / ",
            },
            student: {
              $ref: "#/components/schemas/Gebruiker",
            },
            bijlagen: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Bijlage",
              },
              uniqueItems: true,
            },
            inzending: {
              type: "string",
              format: "date",
              default: Date.now,
            },
            gradering: {
              $ref: "#/components/schemas/Gradering",
            },
          },
        },
        Gradering: {
          type: "object",
          required: ["docent"],
          properties: {
            _id: {
              type: "string",
              example: "graderingId",
            },
            feedback: {
              type: "string",
              example: "Goed gedaan!",
            },
            score: {
              type: "number",
              example: 85,
            },
            docent: {
              $ref: "#/components/schemas/Gebruiker",
            },
          },
        },
        Bijlage: {
          type: "object",
          required: ["url"],
          properties: {
            _id: {
              type: "string",
              example: "bijlageId",
            },
            URL: {
              type: "string",
              example:
                "http://res.cloudinary.com/dqcloud/image/upload/bijlagen-gebruikerId/bijlage-00000000-naam.png",
            },
            gebruiker: {
              $ref: "#/components/schemas/Gebruiker",
            },
            publicId: {
              type: "string",
              example: "bijlagen-gebruikerId/bijlage-00000000-naam.png",
            },
          },
        },
        Stagedagboek: {
          type: "object",
          required: ["datum", "stagebedrijf", "uitvoering", "ervaring"],
          properties: {
            _id: {
              type: "string",
              example: "dagboekId",
            },
            student: {
              $ref: "#/components/schemas/Gebruiker",
            },
            klasgroep: {
              $ref: "#/components/schemas/Klasgroep",
            },
            stageverslag: {
              $ref: "#/components/schemas/Stageverslag",
            },
            stagedagen: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Stagedag",
              },
              uniqueItems: true,
            },
          },
        },
        Stagedag: {
          type: "object",
          required: ["datum", "voormiddag", "namiddag", "tools", "resultaat"],
          properties: {
            _id: {
              type: "string",
              example: "dagId",
            },
            datum: {
              type: "string",
              format: "date",
              example: Date.now(),
            },
            voormiddag: {
              type: "string",
              example: "- intro werkvloer\n- kennismaking collegas / omgeving",
            },
            namiddag: {
              type: "string",
              example: "- intro stageproject",
            },
            tools: {
              type: "string",
              example: "- ddev\n- drupal\n- docker",
            },
            resultaat: {
              type: "string",
              example:
                "Kennismaking ging vlot, ik hoop dat de opdracht ook zo vlot gaat",
            },
            bijlagen: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Bijlage",
              },
              uniqueItems: true,
            },
          },
        },
        Stageverslag: {
          type: "object",
          required: [
            "datum",
            "stagebedrijf",
            "uitvoering",
            "ervaring",
            "bijgeleerd",
            "conclusie",
            "score",
            "reflectie",
          ],
          properties: {
            _id: {
              type: "string",
              example: "verslagId",
            },
            datum: {
              type: "string",
              format: "date",
              example: Date.now(),
            },
            stagebedrijf: {
              type: "string",
              example: "Drupal Bedrijf in Antwerpen",
            },
            uitvoering: {
              type: "string",
              example: "Opdracht vervolledigd",
            },
            ervaring: {
              type: "string",
              example: "Ging vlot",
            },
            bijgeleerd: {
              type: "string",
              example: "Tis nog altijd drupal",
            },
            conclusie: {
              type: "string",
              example: "Drupal is even moeilijk op de werkvloer als in de klas",
            },
            score: {
              type: "number",
              example: 9,
            },
            reflectie: {
              type: "string",
              example: "Ik heb dit goed gedaan",
            },
            bijlagen: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Bijlage",
              },
              uniqueItems: true,
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Gebruiker kan inloggen",
            },
          },
        },
        KlasgroepDump: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "klasgroepId",
            },
            naam: {
              type: "string",
              example: "Full Stack",
            },
            beginjaar: {
              type: "number",
              example: new Date().getFullYear(),
            },
            eindjaar: {
              type: "number",
              example: new Date().getFullYear() + 1,
            },
            studenten: {
              type: "array",
              items: {
                $ref: "#/components/schemas/GebruikerDump",
              },
              uniqueItems: true,
            },
            vakken: {
              type: "array",
              items: {
                $ref: "#/components/schemas/VakDump",
              },
              uniqueItems: true,
            },
            taken: {
              type: "array",
              items: {
                $ref: "#/components/schemas/TaakDump",
              },
              uniqueItems: true,
            },
          },
        },
        GebruikerDump: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "gebruikerId",
            },
            naam: {
              type: "string",
              example: "John",
            },
            achternaam: {
              type: "string",
              example: "Doe",
            },
            email: {
              type: "string",
              example: "example@mail.com",
            },
            foto: {
              type: "string",
              example:
                "http://res.cloudinary.com/dqcloud/image/upload/profielen/profiel-00000000000000",
            },
            isDocent: {
              type: "boolean",
              default: false,
            },
            vakken: {
              type: "array",
              items: {
                $ref: "#/components/schemas/VakDump",
              },
              uniqueItems: true,
            },
            taken: {
              type: "array",
              items: {
                $ref: "#/components/schemas/TaakDump",
              },
              uniqueItems: true,
            },
            dagboek: {
              $ref: "#/components/schemas/DagboekDump",
            },
          },
        },
        VakDump: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "vakId",
            },
            naam: {
              type: "string",
              example: "Javascript",
            },
            gemiddelde: {
              type: "number",
              example: 56.8,
            },
            klasgemiddelde: {
              type: "number",
              example: 75.3,
            },
          },
        },
        TaakDump: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "taakId",
            },
            type: {
              type: "string",
              enum: ["taak", "test"],
              default: "taak",
            },
            titel: {
              type: "string",
              example: "React Todo-app",
            },
            beschrijving: {
              type: "string",
              example:
                "Maak nog maar eens een todo app met een nieuw framework",
            },
            deadline: {
              type: "string",
              format: "date",
              example: new Date(),
            },
            weging: {
              type: "number",
              example: 0.2,
            },
            maxScore: {
              type: "number",
              example: 100,
            },
            isGepubliceerd: {
              type: "boolean",
              default: false,
            },
            klasgroep: {
              type: "string",
              example: "klasgroepId",
            },
            score: {
              type: "number",
              example: 56.8,
            },
            klasgemiddelde: {
              type: "number",
              example: 75.3,
            },
            volledigGegradeerd: {
              type: "boolean",
              example: false,
            },
            vak: {
              type: "object",
              properties: {
                _id: {
                  type: "string",
                  example: "vakId",
                },
                naam: {
                  type: "string",
                  example: "Javascript",
                },
              },
            },
            bijlagen: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Bijlage",
              },
              uniqueItems: true,
            },
            inzendingen: {
              type: "array",
              items: {
                $ref: "#/components/schemas/InzendingDump",
              },
              uniqueItems: true,
            },
          },
        },
        InzendingDump: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "inzendingId",
            },
            git: {
              type: "string",
              example: "github.com/gebruiker/repo",
            },
            live: {
              type: "string",
              example: "todo-app-van-gebruiker.surge.sh",
            },
            beschrijving: {
              type: "string",
              example: " / ",
            },
            student: {
              type: "string",
              example: "gebruikerId",
            },
            score: {
              type: "number",
              example: 56.8,
            },
            bijlagen: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Bijlage",
              },
              uniqueItems: true,
            },
            gradering: {
              type: "array",
              items: {
                $ref: "#/components/schemas/GraderingDump",
              },
              uniqueItems: true,
            },
          },
        },
        GraderingDump: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "graderingId",
            },
            docent: {
              $ref: "#/components/schemas/DocentDump",
            },
            score: {
              type: "number",
              example: 56.8,
            },
            feedback: {
              type: "string",
              example: "Kan beter!",
            },
          },
        },
        DocentDump: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "gebruikerId",
            },
            naam: {
              type: "string",
              example: "John",
            },
            achternaam: {
              type: "string",
              example: "Doe",
            },
            email: {
              type: "string",
              example: "example@mail.com",
            },
            foto: {
              type: "string",
              example:
                "http://res.cloudinary.com/dqcloud/image/upload/profielen/profiel-00000000000000",
            },
          },
        },
        DagboekDump: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "dagboekId",
            },
            dagen: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Stagedag",
              },
              uniqueItems: true,
            },
            verslag: {
              $ref: "#/components/schemas/Stageverslag",
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "Geen toegang tot deze pagina",
          schema: {
            $ref: "#/definitions/Error",
          },
        },
        Unauthorized_Resource: {
          description: "Geen toegang tot deze {item}",
          schema: {
            $ref: "#/definitions/Error",
          },
        },
        BadRequest_FileUpload: {
          description: "Geen/verkeerde file geupload",
          schema: {
            $ref: "#/definitions/Error",
          },
        },
        BadRequest_MissingField: {
          description: "{veld} is verplicht",
          schema: {
            $ref: "#/definitions/Error",
          },
        },
        BadRequest_Duplicate: {
          description: "{item} bestaat al",
          schema: {
            $ref: "#/definitions/Error",
          },
        },
        PageNotFound: {
          description: "{item} niet gevonden",
          schema: {
            $ref: "#/definitions/Error",
          },
        },
      },
      // links: {
      //   GetTaak: {
      //     operationId: "getTaak",
      //     parameters: {
      //       taakId: "$response.body#/_id",
      //     },
      //     description: "`_id -> taakId` in `GET /taken/{taakId}`",
      //   },
      //   UpdateTaak: {
      //     operationId: "updateTaak",
      //     parameters: {
      //       taakId: "$response.body#/_id",
      //     },
      //     description: "`_id -> taakId` in `PATCH /taken/{taakId}`",
      //   },
      //   DeleteTaak: {
      //     operationId: "deleteTaak",
      //     parameters: {
      //       taakId: "$response.body#/_id",
      //     },
      //     description: "`_id -> taakId` in `DELETE /taken/{taakId}`",
      //   },
      //   DupliceerTaak: {
      //     operationId: "dupliceerTaak",
      //     requestBody: "$response.body#/_id",

      //     description: "`_id -> taakId` in `POST /taken/{taakId}/dupliceer`",
      //   },
      //   GetInzending: {
      //     operationId: "getInzending",
      //     parameters: {
      //       inzendingId: "$response.body#/_id",
      //     },
      //     description:
      //       "Het '_id' dat teruggegeven wordt kan als parameter 'inzendingId' in `GET /inzendingen/{inzendingId}` gebruikt worden.",
      //   },
      // },
    },
    definitions: {
      Error: {
        type: "object",
        required: ["code", "message"],
        properties: {
          code: {
            type: "string",
          },
          message: {
            type: "string",
          },
        },
      },
    },

    tags: [
      {
        name: "Dump",
        description: '"Dump" endpoints - alle mogelijke data in één object',
      },
      {
        name: "Auth",
        description: "Authentication endpoints",
      },
      {
        name: "Profiel",
        description: "Gebruiker endpoints",
      },

      {
        name: "Dagboek",
        description: "Stagedagboek endpoints",
      },
      { name: "Klassen", description: "Klasgroepen endpoints" },
      { name: "Taken", description: "Taken endpoints" },
      { name: "Inzendingen", description: "Inzendingen endpoints" },
      { name: "Graderingen", description: "Graderingen endpoints" },
      { name: "Bijlagen", description: "Bijlagen endpoints" },
    ],
  },
  apis: ["**/*.ts"],
};

export const specs = swaggerJsdoc(options);
