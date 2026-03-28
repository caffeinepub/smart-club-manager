import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ContactMessage {
    id: bigint;
    name: string;
    email: string;
    message: string;
    timestamp: bigint;
}
export interface Notification {
    id: bigint;
    userId: Principal;
    read: boolean;
    message: string;
    timestamp: bigint;
}
export interface Event {
    id: bigint;
    status: EventStatus;
    title: string;
    clubId: bigint;
    date: bigint;
    createdAt: bigint;
    createdBy: Principal;
    description: string;
    registeredUsers: Array<Principal>;
    location: string;
}
export interface Club {
    id: bigint;
    name: string;
    createdAt: bigint;
    createdBy: Principal;
    memberCount: bigint;
    description: string;
    imageUrl: string;
    category: string;
}
export interface UserProfileInput {
    bio: string;
    name: string;
    email: string;
}
export interface UserProfile {
    bio: string;
    principal: Principal;
    joinedClubs: Array<bigint>;
    name: string;
    createdAt: bigint;
    role: UserRole;
    email: string;
    registeredEvents: Array<bigint>;
}
export enum EventStatus {
    upcoming = "upcoming",
    pending = "pending",
    past = "past"
}
export enum UserRole {
    admin = "admin",
    student = "student"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveEvent(id: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    createClub(name: string, description: string, category: string, imageUrl: string): Promise<bigint>;
    createEvent(title: string, description: string, clubId: bigint, date: bigint, location: string): Promise<bigint>;
    createProfile(input: UserProfileInput): Promise<void>;
    deleteClub(id: bigint): Promise<void>;
    deleteEvent(id: bigint): Promise<void>;
    getAllClubs(): Promise<Array<Club>>;
    getAllContactMessages(): Promise<Array<ContactMessage>>;
    getAllEvents(): Promise<Array<Event>>;
    getAllStudents(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getClub(id: bigint): Promise<Club | null>;
    getClubEvents(clubId: bigint): Promise<Array<Event>>;
    getEvent(id: bigint): Promise<Event | null>;
    getMyNotifications(): Promise<Array<Notification>>;
    getMyProfile(): Promise<UserProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initAdmin(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    joinClub(clubId: bigint): Promise<void>;
    leaveClub(clubId: bigint): Promise<void>;
    markAllNotificationsRead(): Promise<void>;
    markNotificationRead(id: bigint): Promise<void>;
    registerForEvent(eventId: bigint): Promise<void>;
    rejectEvent(id: bigint): Promise<void>;
    setAdminRole(target: Principal): Promise<void>;
    submitContactMessage(name: string, email: string, message: string): Promise<void>;
    unregisterFromEvent(eventId: bigint): Promise<void>;
    updateCallerUserProfile(input: UserProfileInput): Promise<void>;
    updateClub(id: bigint, name: string, description: string, category: string, imageUrl: string): Promise<void>;
    updateEvent(id: bigint, title: string, description: string, date: bigint, location: string): Promise<void>;
    updateProfile(input: UserProfileInput): Promise<void>;
}
