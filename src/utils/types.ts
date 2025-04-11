import { TBijlage } from "../models/BijlageModel";
import { TGebruiker } from "../models/GebruikerModel";
import { TGradering } from "../models/GraderingModel";
import { TInzending } from "../models/InzendingModel";
import { TKlasgroep } from "../models/KlasgroepModel";
import { TStagedagboek } from "../models/StagedagboekModel";
import { TStagedag } from "../models/StagedagModel";
import { TStageverslag } from "../models/StageverslagModel";
import { TTaak } from "../models/TaakModel";
import { TVak } from "../models/VakModel";
import { Request as Req, Response as Res, NextFunction as Next } from "express";

export type Request = Req & { gebruiker?: any };
export type Response = Res;
export type NextFunction = Next;

export type GraderingDump = Omit<TGradering, "docent"> & {
  docent: TGebruiker;
};
export type InzendingDump = Omit<TInzending, "gradering" | "bijlagen"> & {
  gradering: GraderingDump[];
  bijlagen: TBijlage[];
};

export type InzendingDumpPlus = InzendingDump & {
  score: number | undefined;
};

export type TaakDump = Omit<TTaak, "inzendingen" | "vak" | "bijlagen"> & {
  inzendingen: InzendingDump[];
  vak: TVak;
  bijlagen: TBijlage[];
};

export type TaakDumpPlus = Omit<TaakDump, "inzendingen"> & {
  inzendingen: InzendingDumpPlus[];
  score: number | undefined | null;
  klasgemiddelde: number | null;
  volledigGegradeerd: boolean;
};

export type VakDump = TVak & {};

export type VakDumpPlus = VakDump & {
  gemiddelde: number | undefined | null;
  klasgemiddelde: number | null;
};
export type StagedagDump = Omit<TStagedag, "bijlagen"> & {
  bijlagen: TBijlage[];
};

export type StageverslagDump = Omit<TStageverslag, "bijlagen"> & {
  bijlagen: TBijlage[];
};

export type StagedagboekDump = Omit<TStagedagboek, "dagen" | "verslag"> & {
  dagen: StagedagDump[];
  verslag: StageverslagDump;
};
export type GebruikerDump = TGebruiker & {
  stagedagboek: StagedagboekDump;
  vakken: VakDumpPlus[];
  taken: TaakDumpPlus[];
};

export type KlasgroepDump = TKlasgroep & {
  studenten: GebruikerDump[];
  vakken: VakDumpPlus[];
  taken: TaakDumpPlus[];
};

/**
 * Gebruiker - klasgroep:
 * * Vakken
 * * Taken: -> isGepubliceerd
 * * * Inzendingen: -> Gebruiker
 * * * * Gradering
 * * Dagboek
 *
 *
 * Klasgroep:
 * * GebruikerDump[]
 */
