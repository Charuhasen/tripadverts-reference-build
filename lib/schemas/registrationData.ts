export type AccountType = "individual" | "business";
export type CountryCode = "GH" | "NG" | "US" | "UK";

export const COUNTRY_OPTIONS = [
    { label: "Ghana", value: "GH" },
    { label: "Nigeria", value: "NG" },
    { label: "United States", value: "US" },
    { label: "United Kingdom", value: "UK" },
] as const;

export interface RegistrationData {
    country: CountryCode | "";
    accountType: AccountType | "";
    identity: Record<string, any>;
    business: Record<string, any>;
    directors: Array<Record<string, any>>;
    banking: Record<string, any>;
}

export const initialRegistrationData: RegistrationData = {
    country: "",
    accountType: "",
    identity: {},
    business: {},
    directors: [],
    banking: {},
};
