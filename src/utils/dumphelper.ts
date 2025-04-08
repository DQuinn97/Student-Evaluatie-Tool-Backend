import { Gebruiker } from "../models/GebruikerModel";
import { Klasgroep } from "../models/KlasgroepModel";
import { Stagedagboek } from "../models/StagedagboekModel";
import { Taak } from "../models/TaakModel";
import { NotFoundError } from "../utils/errors";
import {
  GebruikerDump,
  GraderingDump,
  InzendingDump,
  InzendingDumpPlus,
  KlasgroepDump,
  StagedagboekDump,
  TaakDump,
  TaakDumpPlus,
  VakDump,
  VakDumpPlus,
} from "../utils/types";

// komplete dump voor alle scores van een student in een klasgroep
export const gebruikerDump = async (
  studentId: string,
  klasgroepId: string
): Promise<GebruikerDump> => {
  // check of gebruiker bestaat
  const student = await Gebruiker.findById(studentId).select(
    "-wachtwoord -createdAt -updatedAt -__v"
  );

  if (!student) throw new NotFoundError("Gebruiker niet gevonden");

  // check of klasgroep bestaat
  const klasgroep = (await Klasgroep.findOne(
    {
      _id: klasgroepId,
      studenten: studentId,
    },
    { select: "-studenten -createdAt -updatedAt -__v" }
  ).populate([
    { path: "vakken", select: "-createdAt -updatedAt -__v" },
  ])) as KlasgroepDump;
  if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

  const vakken = klasgroep.vakken as VakDump[];

  // zoek alle gepubliceerde taken in een klasgroep en populate
  const taken = (await Taak.find({
    klasgroep: klasgroepId,
    isGepubliceerd: true,
  })
    .populate([
      { path: "bijlagen" },
      {
        path: "inzendingen",
        populate: [
          {
            path: "gradering",
            populate: {
              path: "docent",
              select: "_id naam achternaam email foto",
            },
            select: "_id docent score maxscore feedback",
          },
          { path: "bijlagen" },
        ],
        select: "-createdAt -updatedAt -__v",
      },
      { path: "vak", select: "_id naam" },
    ])
    .select("-createdAt -updatedAt -__v")) as unknown as TaakDump[];

  // zoek het stagedagboek van de student in de klasgroep en populate
  const dagboek = (await Stagedagboek.findOne(
    {
      student: studentId,
      klasgroep: klasgroepId,
    },
    { select: "-student -klasgroep" }
  ).populate([
    { path: "stageverslag", populate: [{ path: "bijlagen" }] },
    { path: "stagedagen", populate: [{ path: "bijlagen" }] },
  ])) as StagedagboekDump;

  // maak de dump van alle taken, met scores en klasgemiddelden
  const takenDump = taken.map((taak) => {
    // dump voorbereiden
    let taakDump = {
      ...taak.toObject(),
      score: undefined,
      klasgemiddelde: null,
      volledigGegradeerd: false,
    } as unknown as TaakDumpPlus;

    // maak de dump van alle inzendingen, met scores doorgegeven van gradering
    taakDump.inzendingen = taak.inzendingen.map((inzending) => {
      // dump voorbereiden
      let inzendingDump = {
        ...inzending.toObject(),
        score: undefined,
      } as unknown as InzendingDumpPlus;

      // inzending score uit gradering halen
      inzendingDump.score =
        inzending.gradering.reduce(
          (acc: number, gradering) =>
            acc + gradering.score / gradering.maxscore,
          0
        ) / inzending.gradering.length;
      return inzendingDump;
    }) as InzendingDumpPlus[];

    // alle gegradeerde inzendingen ophalen voor tijdelijke gemiddelde berekening
    let gegradeerdeInzendingen = taakDump.inzendingen.filter(
      (inzending) => inzending.score
    );

    // geef aan als alle inzendingen gegradeerd zijn
    if (
      taakDump.inzendingen.length &&
      gegradeerdeInzendingen.length === taakDump.inzendingen.length
    )
      taakDump.volledigGegradeerd = true;

    // klasgemiddelde berekenen
    taakDump.klasgemiddelde =
      gegradeerdeInzendingen.reduce(
        (acc: number, inzending) => acc + inzending.score!,
        0
      ) / gegradeerdeInzendingen.length;

    // taak score uit inzending halen
    const inzendingVanStudent = taakDump.inzendingen.filter(
      (inzending) => inzending.student.toString() == studentId
    )[0];
    taakDump.score = inzendingVanStudent?.score || null;

    return taakDump;
  }) as TaakDumpPlus[];

  // maak de dump van alle vakken, met gemiddelde scores en klasgemiddelden
  const vakkenDump = vakken.map((vak) => {
    // dump voorbereiden
    let vakDump = {
      ...vak.toObject(),
      gemiddelde: undefined,
      klasgemiddelde: null,
    } as VakDumpPlus;

    // alle taken van dit vak uit takenDump halen
    const taken = takenDump.filter((taak) => taak.vak?._id == vak._id);

    // overige weging berekenen
    const overigeWeging = taken.reduce(
      (acc: number, taak) => acc - taak.weging,
      1
    );
    const takenMetWeging = taken.filter((taak) => taak.weging);
    const takenZonderWeging = taken.filter((taak) => !taak.weging);

    // klasgemiddelde berekenen
    vakDump.klasgemiddelde =
      takenDump
        .filter((taak) => taak.vak?._id == vak._id)
        .reduce(
          (acc: number, taak) =>
            acc +
            taak.klasgemiddelde! *
              (taak.weging
                ? taak.weging
                : overigeWeging / takenZonderWeging.length),
          0
        ) / takenDump.length;

    // gemiddelde berekenen
    vakDump.gemiddelde =
      takenDump
        .filter((taak) => taak.vak?._id == vak._id)
        .reduce(
          (acc: number, taak) =>
            acc +
            taak.score! *
              (taak.weging
                ? taak.weging
                : overigeWeging / takenZonderWeging.length),
          0
        ) / takenDump.length;

    return vakDump;
  }) as VakDumpPlus[];

  // taken van andere studenten wegfilteren uit eindresultaat
  const filteredTakenDump = takenDump.map((taak) => {
    taak.inzendingen = taak.inzendingen.filter(
      (inzending) => inzending.student.toString() == studentId
    );
    return taak;
  }) as TaakDumpPlus[];

  // maak de dump van het hele student object
  const gebruikerDump = {
    ...student.toObject(),
    vakken: vakkenDump,
    taken: filteredTakenDump,
    stagedagboek: dagboek,
  } as GebruikerDump;

  return gebruikerDump;
};
