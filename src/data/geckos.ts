export type GeckoStatus = 'available' | 'reserved' | 'sold';
export type Gender = 'male' | 'female' | 'unsexed';

export interface Category {
  id: string;
  name: string;
}

// Tutaj możesz dodawać własne kategorie zwierząt w przyszłości
export const categories: Category[] = [
  { id: 'lamparci', name: 'Gekon Lamparci' },
  { id: 'orzesiony', name: 'Gekon Orzęsiony' },
];

export interface Gecko {
  id: string;
  categoryId: string; // Przypisanie do kategorii z listy wyżej
  name?: string;
  morph: string;
  gender: Gender;
  weight: number;
  price: number;
  images: string[];
  status: GeckoStatus;
  description: string;
  birth_date?: string;
}

export const geckos: Gecko[] = [
  {
    id: "LG-0104",
    categoryId: "lamparci",
    name: "Tangerine Dream",
    morph: "Tangerine",
    gender: "female",
    weight: 55,
    price: 299,
    images: ["/hero.png"],
    status: "available",
    description: "Piękna samica z wyraźnym pomarańczowym odcieniem (Tangerine). Karmiona regularnie mącznikiem i świerszczami z odpowiednią suplementacją wapnia i witamin. Bardzo aktywna wieczorami, idealnie nadaje się do dalszych projektów hodowlanych.",
    birth_date: "2023-04-12"
  },
  {
    id: "LG-0105",
    categoryId: "lamparci",
    name: "Snowflake",
    morph: "Mack Snow",
    gender: "female",
    weight: 42,
    price: 450,
    images: ["/hero.png", "/hero.png"], // Example of multiple photos
    status: "available",
    description: "Spokojna samicyka o ubarwieniu Mack Snow. Idealny apetyt. Bardzo dobrze reaguje na podawanie pokarmu z pęsety. Posiada dokumentację weterynaryjną.",
    birth_date: "2024-01-05"
  },
  {
    id: "LG-0106",
    categoryId: "lamparci",
    name: "Raptor",
    morph: "Striped APTOR",
    gender: "male",
    weight: 48,
    price: 380,
    images: ["/hero.png"],
    status: "available",
    description: "Samiec o świetnej budowie ciała. Przeszedł już jedną udaną zimowkę. Bardzo silne instynkty, co czyni go wspaniałym reproduktorem. Ze względu na zgaszoną barwę, bardzo ładnie kontrastuje.",
    birth_date: "2023-08-20"
  },
  {
    id: "LG-0107",
    categoryId: "lamparci",
    morph: "Black Night Cross",
    gender: "female",
    weight: 38,
    price: 850,
    images: ["/hero.png"],
    status: "available",
    description: "Wybitna samica genetyczna - Black Night Cross. Bardzo ciemna barwa. Jadła tylko i wyłącznie dubię w ostatnich 3 miesiącach. Doskonała dla poszukiwaczy ciemnych odmian.",
    birth_date: "2024-03-10"
  },
  {
    id: "LG-0108",
    categoryId: "lamparci",
    name: "Sunny",
    morph: "High Yellow",
    gender: "male",
    weight: 60,
    price: 200,
    images: ["/hero.png"],
    status: "reserved",
    description: "Klasyczny, bardzo jaskrawy samiec High Yellow. Świetnie nadaje się na pierwszego gekona dla początkującego hodowcy ze względu na bardzo łagodny charakter.",
    birth_date: "2022-11-15"
  }
];
