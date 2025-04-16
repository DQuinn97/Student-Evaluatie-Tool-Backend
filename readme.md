# Student Evaluatie Tool

Een moderne web-applicatie om het beheer van taken, toetsen en stagedagboeken voor docenten en studenten te vereenvoudigen. Dit project is ontwikkeld door [Matti](https://github.com/MattiVboiii) en [Quinten](https://github.com/DQuinn97).

## Projectbeschrijving

Deze applicatie biedt docenten en studenten een gebruiksvriendelijk platform om het beheer van taken en toetsen efficiënter te maken. Met een moderne technologie-stack en een goed gestructureerd backend-systeem zorgt de applicatie voor een naadloze ervaring voor beide gebruikersgroepen. De toevoeging van het stagedagboek stelt studenten in staat om hun stage-ervaringen te documenteren en eenvoudig te beheren.

## API Features

- **Authenticatie & Autorisatie**: JWT-token gebaseerde authenticatie voor veilige toegang
- **REST API**: Volledig RESTful API-ontwerp voor gemakkelijke integratie
- **CRUD Operaties**: Complete ondersteuning voor Create, Read, Update en Delete operaties
- **Bestandsverwerking**: Upload en beheer van bestanden via Cloudinary
- **Complexe Datastructuren**: Uitgebreide modellen voor het beheren van educatieve gegevens
- **API Documentatie**: Volledige Swagger/OpenAPI documentatie

## API Endpoints

### Gebruikersbeheer

- **/auth**: Registratie, inloggen, wachtwoordreset
- **/profiel**: Gebruikersgegevens, profielfoto, persoonlijke instellingen

### Klasgroepen

- **/klassen**: Klasgroepen aanmaken en beheren
- **/klassen/{id}/studenten**: Studenten toevoegen/verwijderen uit klassen
- **/klassen/{id}/vakken**: Vakken toevoegen/verwijderen uit klassen

### Taken & Inzendingen

- **/klassen/{id}/taken**: Taken voor een specifieke klasgroep
- **/taken/{id}**: Individuele taakbewerkingen
- **/taken/{id}/inzendingen**: Inzendingen voor een taak
- **/inzendingen/{id}**: Individuele inzendingbewerkingen
- **/inzendingen/{id}/gradering**: Beoordeling toevoegen aan inzending

### Stagedagboek

- **/dagboek/{id}**: Stagedagboekbewerkingen
- **/dagboek/{id}/dag**: Dag toevoegen aan stagedagboek
- **/dagboek/{id}/verslag**: Verslag toevoegen aan stagedagboek

## Projectstructuur

```
├── src
│   ├── controllers       # Logica voor API endpoints
│   │   ├── authController.ts
│   │   ├── bijlageController.ts
│   │   ├── dumpController.ts
│   │   ├── gebruikerController.ts
│   │   ├── graderingController.ts
│   │   ├── inzendingController.ts
│   │   ├── klasgroepController.ts
│   │   ├── stagedagboekController.ts
│   │   └── taakController.ts
│   ├── middleware        # Express middleware
│   │   ├── authMiddleware.ts
│   │   ├── loggerMiddleware.ts
│   │   ├── multerMiddleware.ts
│   │   └── uniqueMiddleware.ts
│   ├── models            # Mongoose modellen
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
│   ├── routes            # API routes definities
│   │   ├── authRoutes.ts
│   │   ├── bijlageRoutes.ts
│   │   ├── gebruikerRoutes.ts
│   │   ├── graderingRoutes.ts
│   │   ├── inzendingRoutes.ts
│   │   ├── klasgroepRoutes.ts
│   │   ├── stagedagboekRoutes.ts
│   │   └── taakRoutes.ts
│   ├── utils             # Helper functies
│   │   ├── cloudinary.ts
│   │   ├── dumphelper.ts
│   │   ├── errors.ts
│   │   ├── helpers.ts
│   │   └── types.ts
│   ├── server.ts         # Hoofdentry point
│   └── swagger.ts        # Swagger JSDocs configuratie
```

## Technische Stack

- **Node.js**: Runtime omgeving
- **Express**: Web framework
- **TypeScript**: Voor type-veiligheid en beter onderhoudbare code
- **MongoDB**: NoSQL database voor flexibele dataopslag
- **Mongoose**: ODM (Object Document Mapper) voor MongoDB
- **JWT**: JSON Web Tokens voor authenticatie
- **Multer**: Voor bestandsupload verwerking
- **Cloudinary**: Cloud-based bestandsopslag
- **Swagger/OpenAPI**: API documentatie
- **TSX**: Automatische server herstart tijdens ontwikkeling

## Installatie

1. Clone deze repository:

```bash
git clone https://github.com/DQuinn97/Student-Evaluatie-Tool-Backend.git
cd Student-Evaluatie-Tool-Backend
```

2. Installeer dependencies:

```bash
npm install
```

3. Configureer omgevingsvariabelen door een `.env` bestand aan te maken:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/student-evaluatie-tool
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
...
```

4. Start de ontwikkelomgeving:

```bash
npm run dev
```

5. De API is nu beschikbaar op [http://localhost:3000](http://localhost:3000)
6. Swagger documentatie is beschikbaar op [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Scripts

- `npm run dev`: Start de ontwikkelserver met hot-reloading
- `npm run build`: Compileert de TypeScript broncode naar JavaScript
- `npm start`: Start de productieserver

## Frontend Setup

Voor de volledige functionaliteit is de bijbehorende frontend vereist:

1. Clone de frontend repository:

```bash
git clone https://github.com/DQuinn97/Student-Evaluatie-Tool.git
cd Student-Evaluatie-Tool
```

2. Volg de installatie-instructies in de frontend README.md

## Bijdragen

Dit project is ontwikkeld als vervangende stageopdracht voor de opleiding Full Stack Developer bij Syntra.
