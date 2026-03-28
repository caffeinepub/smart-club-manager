import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import List "mo:core/List";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Int "mo:core/Int";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type UserRole = {
    #student;
    #admin;
  };

  type UserProfile = {
    principal : Principal;
    name : Text;
    email : Text;
    bio : Text;
    role : UserRole;
    joinedClubs : [Nat];
    registeredEvents : [Nat];
    createdAt : Int;
  };

  module UserProfile {
    public func compare(userProfile1 : UserProfile, userProfile2 : UserProfile) : Order.Order {
      Principal.compare(userProfile1.principal, userProfile2.principal);
    };
  };

  public type UserProfileInput = {
    name : Text;
    email : Text;
    bio : Text;
  };

  type Club = {
    id : Nat;
    name : Text;
    description : Text;
    category : Text;
    imageUrl : Text;
    memberCount : Nat;
    createdAt : Int;
    createdBy : Principal;
  };

  type EventStatus = {
    #upcoming;
    #past;
    #pending;
  };

  type Event = {
    id : Nat;
    title : Text;
    description : Text;
    clubId : Nat;
    date : Int;
    location : Text;
    registeredUsers : [Principal];
    status : EventStatus;
    createdBy : Principal;
    createdAt : Int;
  };

  type Notification = {
    id : Nat;
    userId : Principal;
    message : Text;
    read : Bool;
    timestamp : Int;
  };

  type ContactMessage = {
    id : Nat;
    name : Text;
    email : Text;
    message : Text;
    timestamp : Int;
  };

  // Commented out unused helper function
  //  func getCurrentTimestamp() : Nat {
  //    Int.abs(Time.now());
  //  };

  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data stores
  let userProfiles = Map.empty<Principal, UserProfile>();
  let clubs = Map.empty<Nat, Club>();
  let events = Map.empty<Nat, Event>();
  let notifications = Map.empty<Nat, Notification>();
  let contactMessages = Map.empty<Nat, ContactMessage>();

  var nextClubId : Nat = 0;
  var nextEventId : Nat = 0;
  var nextNotificationId : Nat = 0;
  var nextContactMessageId : Nat = 0;
  var adminInitialized : Bool = false;

  // Helper functions
  func getProfileInternal(p : Principal) : ?UserProfile {
    userProfiles.get(p);
  };

  func createNotification(userId : Principal, message : Text) {
    let notif = {
      id = nextNotificationId;
      userId = userId;
      message = message;
      read = false;
      timestamp = Int.abs(Time.now());
    };
    notifications.add(nextNotificationId, notif);
    nextNotificationId += 1;
  };

  // Initialize seed data
  func initSeedData() {
    // Create 6 clubs
    let clubData = [
      ("Tech Club", "Explore the latest in technology and programming", "Tech", "https://example.com/tech.jpg"),
      ("Photography Club", "Capture moments and learn photography skills", "Arts", "https://example.com/photo.jpg"),
      ("Sports Club", "Stay active with various sports activities", "Sports", "https://example.com/sports.jpg"),
      ("Drama Club", "Express yourself through theater and performance", "Cultural", "https://example.com/drama.jpg"),
      ("Science Club", "Discover the wonders of science through experiments", "Science", "https://example.com/science.jpg"),
      ("Music Club", "Learn and perform music together", "Arts", "https://example.com/music.jpg"),
    ];

    for ((name, desc, cat, img) in clubData.vals()) {
      let club = {
        id = nextClubId;
        name = name;
        description = desc;
        category = cat;
        imageUrl = img;
        memberCount = 0;
        createdAt = Int.abs(Time.now());
        createdBy = Principal.fromText("aaaaa-aa");
      };
      clubs.add(nextClubId, club);
      nextClubId += 1;
    };

    // Create 5 events
    let now = Int.abs(Time.now());
    let eventData = [
      ("Coding Workshop", "Learn web development basics", 0, now + 86400000000000, "Room 101"),
      ("Photo Walk", "Outdoor photography session in the park", 1, now + 172800000000000, "City Park"),
      ("Basketball Tournament", "Inter-club basketball competition", 2, now + 259200000000000, "Sports Hall"),
      ("Theater Performance", "Annual drama club showcase", 3, now + 345600000000000, "Auditorium"),
      ("Science Fair", "Present your science projects", 4, now + 432000000000000, "Science Lab"),
    ];

    for ((title, desc, clubId, date, loc) in eventData.vals()) {
      let event = {
        id = nextEventId;
        title = title;
        description = desc;
        clubId = clubId;
        date = date;
        location = loc;
        registeredUsers = [];
        status = #upcoming;
        createdBy = Principal.fromText("aaaaa-aa");
        createdAt = Int.abs(Time.now());
      };
      events.add(nextEventId, event);
      nextEventId += 1;
    };
  };

  initSeedData();

  // User Profile Management
  public shared ({ caller }) func createProfile(input : UserProfileInput) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot create profiles");
    };
    if (userProfiles.containsKey(caller)) {
      Runtime.trap("User already registered");
    };

    let newProfile = {
      principal = caller;
      name = input.name;
      email = input.email;
      bio = input.bio;
      role = #student;
      joinedClubs = [];
      registeredEvents = [];
      createdAt = Int.abs(Time.now());
    };

    userProfiles.add(caller, newProfile);
    AccessControl.assignRole(accessControlState, caller, caller, #user);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getMyProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.isAdmin(accessControlState, caller)) and (caller != user)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    getProfileInternal(user);
  };

  public shared ({ caller }) func updateCallerUserProfile(input : UserProfileInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("You don't have a profile yet") };
      case (?profile) {
        let updatedProfile = {
          principal = caller;
          name = input.name;
          email = input.email;
          bio = input.bio;
          role = profile.role;
          joinedClubs = profile.joinedClubs;
          registeredEvents = profile.registeredEvents;
          createdAt = profile.createdAt;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func updateProfile(input : UserProfileInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("You don't have a profile yet") };
      case (?profile) {
        let updatedProfile = {
          principal = caller;
          name = input.name;
          email = input.email;
          bio = input.bio;
          role = profile.role;
          joinedClubs = profile.joinedClubs;
          registeredEvents = profile.registeredEvents;
          createdAt = profile.createdAt;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getAllStudents() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    userProfiles.values().toArray().sort();
  };

  public shared ({ caller }) func setAdminRole(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (userProfiles.get(target)) {
      case (null) { Runtime.trap("Target user does not have a profile") };
      case (?profile) {
        let updatedProfile = {
          principal = profile.principal;
          name = profile.name;
          email = profile.email;
          bio = profile.bio;
          role = #admin;
          joinedClubs = profile.joinedClubs;
          registeredEvents = profile.registeredEvents;
          createdAt = profile.createdAt;
        };
        userProfiles.add(target, updatedProfile);
        AccessControl.assignRole(accessControlState, caller, target, #admin);
      };
    };
  };

  public shared ({ caller }) func initAdmin() : async () {
    if (adminInitialized) {
      Runtime.trap("Admin already initialized");
    };
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot be admin");
    };

    let adminProfile = {
      principal = caller;
      name = "Admin";
      email = "admin@club.com";
      bio = "System Administrator";
      role = #admin;
      joinedClubs = [];
      registeredEvents = [];
      createdAt = Int.abs(Time.now());
    };

    userProfiles.add(caller, adminProfile);
    AccessControl.assignRole(accessControlState, caller, caller, #admin);
    adminInitialized := true;
  };

  // Club Management
  public shared ({ caller }) func createClub(name : Text, description : Text, category : Text, imageUrl : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let club = {
      id = nextClubId;
      name = name;
      description = description;
      category = category;
      imageUrl = imageUrl;
      memberCount = 0;
      createdAt = Int.abs(Time.now());
      createdBy = caller;
    };
    clubs.add(nextClubId, club);
    nextClubId += 1;
    club.id;
  };

  public shared ({ caller }) func updateClub(id : Nat, name : Text, description : Text, category : Text, imageUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (clubs.get(id)) {
      case (null) { Runtime.trap("Club not found") };
      case (?club) {
        let updated = {
          id = club.id;
          name = name;
          description = description;
          category = category;
          imageUrl = imageUrl;
          memberCount = club.memberCount;
          createdAt = club.createdAt;
          createdBy = club.createdBy;
        };
        clubs.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteClub(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    clubs.remove(id);
  };

  public query func getAllClubs() : async [Club] {
    clubs.values().toArray();
  };

  public query func getClub(id : Nat) : async ?Club {
    clubs.get(id);
  };

  public shared ({ caller }) func joinClub(clubId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join clubs");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("You don't have a profile yet") };
      case (?profile) {
        switch (clubs.get(clubId)) {
          case (null) { Runtime.trap("Club not found") };
          case (?club) {
            let alreadyJoined = profile.joinedClubs.find(func(id) { id == clubId });
            if (alreadyJoined != null) {
              Runtime.trap("Already a member of this club");
            };

            let updatedProfile = {
              principal = profile.principal;
              name = profile.name;
              email = profile.email;
              bio = profile.bio;
              role = profile.role;
              joinedClubs = profile.joinedClubs.concat([clubId]);
              registeredEvents = profile.registeredEvents;
              createdAt = profile.createdAt;
            };
            userProfiles.add(caller, updatedProfile);

            let updatedClub = {
              id = club.id;
              name = club.name;
              description = club.description;
              category = club.category;
              imageUrl = club.imageUrl;
              memberCount = club.memberCount + 1;
              createdAt = club.createdAt;
              createdBy = club.createdBy;
            };
            clubs.add(clubId, updatedClub);

            createNotification(caller, "You have joined " # club.name);
          };
        };
      };
    };
  };

  public shared ({ caller }) func leaveClub(clubId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can leave clubs");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("You don't have a profile yet") };
      case (?profile) {
        switch (clubs.get(clubId)) {
          case (null) { Runtime.trap("Club not found") };
          case (?club) {
            let newJoinedClubs = profile.joinedClubs.filter(func(id) { id != clubId });
            if (newJoinedClubs.size() == profile.joinedClubs.size()) {
              Runtime.trap("You are not a member of this club");
            };

            let updatedProfile = {
              principal = profile.principal;
              name = profile.name;
              email = profile.email;
              bio = profile.bio;
              role = profile.role;
              joinedClubs = newJoinedClubs;
              registeredEvents = profile.registeredEvents;
              createdAt = profile.createdAt;
            };
            userProfiles.add(caller, updatedProfile);

            let updatedClub = {
              id = club.id;
              name = club.name;
              description = club.description;
              category = club.category;
              imageUrl = club.imageUrl;
              memberCount = if (club.memberCount > 0) { club.memberCount - 1 } else { 0 };
              createdAt = club.createdAt;
              createdBy = club.createdBy;
            };
            clubs.add(clubId, updatedClub);
          };
        };
      };
    };
  };

  // Event Management
  public shared ({ caller }) func createEvent(title : Text, description : Text, clubId : Nat, date : Int, location : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create events");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("You don't have a profile yet") };
      case (?profile) {
        let status = if (profile.role == #admin) { #upcoming } else { #pending };
        let event = {
          id = nextEventId;
          title = title;
          description = description;
          clubId = clubId;
          date = date;
          location = location;
          registeredUsers = [];
          status = status;
          createdBy = caller;
          createdAt = Int.abs(Time.now());
        };
        events.add(nextEventId, event);
        nextEventId += 1;
        event.id;
      };
    };
  };

  public shared ({ caller }) func updateEvent(id : Nat, title : Text, description : Text, date : Int, location : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (events.get(id)) {
      case (null) { Runtime.trap("Event not found") };
      case (?event) {
        let updated = {
          id = event.id;
          title = title;
          description = description;
          clubId = event.clubId;
          date = date;
          location = location;
          registeredUsers = event.registeredUsers;
          status = event.status;
          createdBy = event.createdBy;
          createdAt = event.createdAt;
        };
        events.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteEvent(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    events.remove(id);
  };

  public shared ({ caller }) func approveEvent(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (events.get(id)) {
      case (null) { Runtime.trap("Event not found") };
      case (?event) {
        let updated = {
          id = event.id;
          title = event.title;
          description = event.description;
          clubId = event.clubId;
          date = event.date;
          location = event.location;
          registeredUsers = event.registeredUsers;
          status = #upcoming;
          createdBy = event.createdBy;
          createdAt = event.createdAt;
        };
        events.add(id, updated);
        createNotification(event.createdBy, "Your event '" # event.title # "' has been approved");
      };
    };
  };

  public shared ({ caller }) func rejectEvent(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (events.get(id)) {
      case (null) { Runtime.trap("Event not found") };
      case (?event) {
        createNotification(event.createdBy, "Your event '" # event.title # "' has been rejected");
        events.remove(id);
      };
    };
  };

  public query func getAllEvents() : async [Event] {
    events.values().toArray();
  };

  public query func getEvent(id : Nat) : async ?Event {
    events.get(id);
  };

  public query func getClubEvents(clubId : Nat) : async [Event] {
    let allEvents = events.values().toArray();
    allEvents.filter<Event>(func(e) { e.clubId == clubId });
  };

  public shared ({ caller }) func registerForEvent(eventId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register for events");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("You don't have a profile yet") };
      case (?profile) {
        switch (events.get(eventId)) {
          case (null) { Runtime.trap("Event not found") };
          case (?event) {
            let alreadyRegistered = event.registeredUsers.find(func(p) { Principal.equal(p, caller) });
            if (alreadyRegistered != null) {
              Runtime.trap("Already registered for this event");
            };

            let updatedEvent = {
              id = event.id;
              title = event.title;
              description = event.description;
              clubId = event.clubId;
              date = event.date;
              location = event.location;
              registeredUsers = event.registeredUsers.concat([caller]);
              status = event.status;
              createdBy = event.createdBy;
              createdAt = event.createdAt;
            };
            events.add(eventId, updatedEvent);

            let updatedProfile = {
              principal = profile.principal;
              name = profile.name;
              email = profile.email;
              bio = profile.bio;
              role = profile.role;
              joinedClubs = profile.joinedClubs;
              registeredEvents = profile.registeredEvents.concat([eventId]);
              createdAt = profile.createdAt;
            };
            userProfiles.add(caller, updatedProfile);

            createNotification(caller, "You have registered for " # event.title);
          };
        };
      };
    };
  };

  public shared ({ caller }) func unregisterFromEvent(eventId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unregister from events");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("You don't have a profile yet") };
      case (?profile) {
        switch (events.get(eventId)) {
          case (null) { Runtime.trap("Event not found") };
          case (?event) {
            let newRegisteredUsers = event.registeredUsers.filter(func(p) { not Principal.equal(p, caller) });
            if (newRegisteredUsers.size() == event.registeredUsers.size()) {
              Runtime.trap("You are not registered for this event");
            };

            let updatedEvent = {
              id = event.id;
              title = event.title;
              description = event.description;
              clubId = event.clubId;
              date = event.date;
              location = event.location;
              registeredUsers = newRegisteredUsers;
              status = event.status;
              createdBy = event.createdBy;
              createdAt = event.createdAt;
            };
            events.add(eventId, updatedEvent);

            let newRegisteredEvents = profile.registeredEvents.filter(func(id) { id != eventId });
            let updatedProfile = {
              principal = profile.principal;
              name = profile.name;
              email = profile.email;
              bio = profile.bio;
              role = profile.role;
              joinedClubs = profile.joinedClubs;
              registeredEvents = newRegisteredEvents;
              createdAt = profile.createdAt;
            };
            userProfiles.add(caller, updatedProfile);
          };
        };
      };
    };
  };

  // Notifications
  public query ({ caller }) func getMyNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };
    let allNotifs = notifications.values().toArray();
    allNotifs.filter<Notification>(func(n) { Principal.equal(n.userId, caller) });
  };

  public shared ({ caller }) func markNotificationRead(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications");
    };
    switch (notifications.get(id)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?notif) {
        if (not Principal.equal(notif.userId, caller)) {
          Runtime.trap("Unauthorized: Not your notification");
        };
        let updated = {
          id = notif.id;
          userId = notif.userId;
          message = notif.message;
          read = true;
          timestamp = notif.timestamp;
        };
        notifications.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func markAllNotificationsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications");
    };
    for ((id, notif) in notifications.entries()) {
      if (Principal.equal(notif.userId, caller) and not notif.read) {
        let updated = {
          id = notif.id;
          userId = notif.userId;
          message = notif.message;
          read = true;
          timestamp = notif.timestamp;
        };
        notifications.add(id, updated);
      };
    };
  };

  // Contact
  public shared func submitContactMessage(name : Text, email : Text, message : Text) : async () {
    let contact = {
      id = nextContactMessageId;
      name = name;
      email = email;
      message = message;
      timestamp = Int.abs(Time.now());
    };
    contactMessages.add(nextContactMessageId, contact);
    nextContactMessageId += 1;
  };

  public query ({ caller }) func getAllContactMessages() : async [ContactMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    contactMessages.values().toArray();
  };
};
