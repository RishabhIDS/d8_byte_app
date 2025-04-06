export interface Profile {
    uid: string;
    name: string;
    email: string;
    about: string;
    dob: string; // Date of birth as a string (YYYY-MM-DD)
    education: string;
    gender: "male" | "female" | "other";
    createdAt: Date;
    firstDate: string;
    interest: string[]; // Array of interests (e.g., ["Music"])
    interests: string[]; // Another array of interests (e.g., ["female"])
    isProfileComplete: boolean;
    job: string;
    location: string;
    lookingFor: string;
    photos: string[]; // Array of photo URLs
    promotions: boolean;
    uniqueTrait: string;
    age: number;
}
