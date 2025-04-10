import swaggerJsdoc from "swagger-jsdoc";
import { Inzending } from "./models/InzendingModel";
const isProduction = process.env.NODE_ENV === "production";
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Student Evaluatie Tool API",
      version: "1.0.7",
      description: "API documentatie voor Student Evaluatie Tool",
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
            },
            naam: {
              type: "string",
            },
            achternaam: {
              type: "string",
            },
            email: {
              type: "string",
            },
            gsm: {
              type: "string",
            },
            isDocent: {
              type: "boolean",
              default: false,
            },
            foto: {
              type: "string",
            },
          },
        },
        Klasgroep: {
          type: "object",
          required: ["naam", "beginjaar", "eindjaar"],
          properties: {
            _id: {
              type: "string",
            },
            naam: {
              type: "string",
            },
            beginjaar: {
              type: "number",
              minimum: new Date().getFullYear() - 2,
              maximum: new Date().getFullYear() + 5,
            },
            eindjaar: {
              type: "number",
              minimum: new Date().getFullYear() - 2,
              maximum: new Date().getFullYear() + 5,
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
            },
            naam: {
              type: "string",
            },
          },
        },
        Taak: {
          type: "object",
          required: ["titel", "beschrijving", "deadline", "weging"],
          properties: {
            _id: {
              type: "string",
            },
            type: {
              type: "string",
              enum: ["taak", "test"],
              default: "taak",
            },
            titel: {
              type: "string",
            },
            beschrijving: {
              type: "string",
            },
            deadline: {
              type: "string",
              format: "date",
            },
            weging: {
              type: "number",
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
            },
            git: {
              type: "string",
            },
            live: {
              type: "string",
            },
            beschrijving: {
              type: "string",
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
              type: "array",
              items: {
                $ref: "#/components/schemas/Gradering",
              },
              uniqueItems: true,
            },
          },
        },
        Gradering: {
          type: "object",
          required: ["docent"],
          properties: {
            _id: {
              type: "string",
            },
            feedback: {
              type: "string",
            },
            score: {
              type: "number",
            },
            maxscore: {
              type: "number",
              default: 100,
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
            },
            URL: {
              type: "string",
            },
            gebruiker: {
              $ref: "#/components/schemas/Gebruiker",
            },
            publicId: {
              type: "string",
            },
          },
        },
        Stagedagboek: {
          type: "object",
          required: ["datum", "stagebedrijf", "uitvoering", "ervaring"],
          properties: {
            _id: {
              type: "string",
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
            },
            datum: {
              type: "string",
              format: "date",
            },
            voormiddag: {
              type: "string",
            },
            namiddag: {
              type: "string",
            },
            tools: {
              type: "string",
            },
            resultaat: {
              type: "string",
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
            },
            datum: {
              type: "string",
              format: "date",
            },
            stagebedrijf: {
              type: "string",
            },
            uitvoering: {
              type: "string",
            },
            ervaring: {
              type: "string",
            },
            bijgeleerd: {
              type: "string",
            },
            conclusie: {
              type: "string",
            },
            score: {
              type: "number",
            },
            reflectie: {
              type: "string",
            },
            bijlagen: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Bijlage",
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
          },
        },
        KlasgroepDump: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            naam: {
              type: "string",
            },
            beginjaar: {
              type: "number",
              example: 2024,
            },
            eindjaar: {
              type: "number",
              example: 2025,
            },
            studenten: {
              type: "array",
              items: {
                $ref: "#/components/schemas/GebruikerDump",
              },
            },
            vakken: {
              type: "array",
              items: {
                $ref: "#/components/schemas/VakDump",
              },
            },
            taken: {
              type: "array",
              items: {
                $ref: "#/components/schemas/TaakDump",
              },
            },
          },
        },
        GebruikerDump: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            naam: {
              type: "string",
            },
            achternaam: {
              type: "string",
            },
            email: {
              type: "string",
            },
            foto: {
              type: "string",
            },
            isDocent: {
              type: "boolean",
            },
            vakken: {
              type: "array",
              items: {
                $ref: "#/components/schemas/VakDump",
              },
            },
            taken: {
              type: "array",
              items: {
                $ref: "#/components/schemas/TaakDump",
              },
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
            },
            naam: {
              type: "string",
            },
            gemiddelde: {
              type: "number",
            },
            klasgemiddelde: {
              type: "number",
            },
          },
        },
        TaakDump: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            type: {
              type: "string",
              enum: ["taak", "test"],
              example: "taak",
            },
            titel: {
              type: "string",
            },
            beschrijving: {
              type: "string",
            },
            deadline: {
              type: "string",
              format: "date",
            },
            weging: {
              type: "number",
            },
            isGepubliceerd: {
              type: "boolean",
              example: true,
            },
            klasgroep: {
              type: "string",
            },
            score: {
              type: "number",
            },
            klasgemiddelde: {
              type: "number",
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
                },
                naam: {
                  type: "string",
                },
              },
            },
            bijlagen: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Bijlage",
              },
            },
            inzendingen: {
              type: "array",
              items: {
                $ref: "#/components/schemas/InzendingDump",
              },
            },
          },
        },
        InzendingDump: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            git: {
              type: "string",
            },
            live: {
              type: "string",
            },
            beschrijving: {
              type: "string",
            },
            student: {
              type: "string",
            },
            score: {
              type: "number",
            },
            bijlagen: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Bijlage",
              },
            },
            gradering: {
              type: "array",
              items: {
                $ref: "#/components/schemas/GraderingDump",
              },
            },
          },
        },
        GraderingDump: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            docent: {
              $ref: "#/components/schemas/DocentDump",
            },
            score: {
              type: "number",
            },
            maxscore: {
              type: "number",
            },
            feedback: {
              type: "string",
            },
          },
        },
        DocentDump: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            naam: {
              type: "string",
            },
            achternaam: {
              type: "string",
            },
            email: {
              type: "string",
            },
            foto: {
              type: "string",
            },
          },
        },
        DagboekDump: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            dagen: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Stagedag",
              },
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
        name: "Profiel",
        description: "Gebruiker endpoints",
      },
      {
        name: "Auth",
        description: "Authentication endpoints",
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
