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
} from "../utils/types";
export const gebruikerDump = async (
  studentId: string,
  klasgroepId: string
): Promise<GebruikerDump> => {
  // check of gebruiker bestaat
  const student = await Gebruiker.findById(studentId).select("-wachtwoord");
  if (!student) throw new NotFoundError("Gebruiker niet gevonden");

  // check of klasgroep bestaat
  const klasgroep = (await Klasgroep.findOne(
    {
      _id: klasgroepId,
      studenten: studentId,
    },
    { select: "-studenten" }
  ).populate([{ path: "vakken" }])) as KlasgroepDump;
  if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

  const vakken = klasgroep.vakken as VakDump[];

  // zoek alle gepubliceerde taken in een klasgroep en maak een dump
  const taken = (await Taak.find({
    klasgroep: klasgroepId,
    isGepubliceerd: true,
  }).populate([
    { path: "bijlagen" },
    {
      path: "inzendingen",
      populate: [
        {
          path: "gradering",
          populate: { path: "docent", select: "-wachtwoord" },
        },
        { path: "bijlagen" },
        { path: "vak" },
      ],
    },
  ])) as unknown as TaakDump[];
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

  const gebruikerDump = student as GebruikerDump;

  // + score & klasgemiddelde

  const takenDump = taken.map((taak) => {
    let taakDump = {
      ...taak,
      score: undefined,
      klasgemiddelde: null,
      volledigGegradeerd: false,
    } as TaakDumpPlus;
    taakDump.inzendingen = taak.inzendingen.map((inzending) => {
      let inzendingDump = {
        ...inzending,
        score: undefined,
      } as InzendingDumpPlus;

      inzendingDump.score =
        inzending.gradering.reduce(
          (acc: number, gradering) => acc + gradering.score,
          0
        ) / inzending.gradering.length;
      return inzendingDump;
    }) as InzendingDumpPlus[];

    let gegradeerdeInzendingen = taakDump.inzendingen.filter(
      (inzending) => inzending.score
    );
    if (gegradeerdeInzendingen.length === taakDump.inzendingen.length)
      taakDump.volledigGegradeerd = true;

    taakDump.klasgemiddelde =
      gegradeerdeInzendingen.reduce(
        (acc: number, inzending) => acc + inzending.score!,
        0
      ) / gegradeerdeInzendingen.length;

    taakDump.score = taakDump.inzendingen.filter(
      (inzending) => inzending.student.toString() == studentId
    )[0].score;

    return taakDump;
  }) as TaakDumpPlus[];

  gebruikerDump.vakken = vakken;
  gebruikerDump.taken = takenDump;
  gebruikerDump.stagedagboek = dagboek;

  return gebruikerDump;
};
