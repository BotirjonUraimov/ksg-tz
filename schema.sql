
-- Users: Stores user information.
-- UserVerification: Stores email confirmation codes.
-- UserSecurity: Stores security registration data.
-- Items: Stores item listings.
-- ItemImages: Stores images associated with items.
-- ItemTags: Stores tags/categories associated with items.
-- ProductData: Stores detailed product data.
-- Transactions: Stores buying and selling transactions.
-- Payments: Stores payment information.
-- ChatLogs: Stores chat messages between users.
-- ShoppingCart: Stores items added to shopping carts.
-- AdminActions: Stores admin activities.
-- Claims: Stores user claims and reports.

CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Nickname VARCHAR(50) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    IsActive BOOLEAN DEFAULT FALSE,
    IsSeller BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE UserVerification (
    UserID INTEGER REFERENCES Users(UserID) ON DELETE CASCADE,
    VerificationCode VARCHAR(6) NOT NULL,
    ExpiresAt TIMESTAMP NOT NULL,
    PRIMARY KEY (UserID)
);


CREATE TABLE UserSecurity (
    UserID INTEGER REFERENCES Users(UserID) ON DELETE CASCADE,
    BusinessLicense VARCHAR(255),
    Cellphone VARCHAR(20),
    BankAccount VARCHAR(50),
    Verified BOOLEAN DEFAULT FALSE,
    VerificationDate TIMESTAMP
);

CREATE TABLE Items (
    ItemID SERIAL PRIMARY KEY,
    UserID INTEGER REFERENCES Users(UserID) ON DELETE CASCADE,
    Title VARCHAR(255) NOT NULL,
    Description TEXT NOT NULL,
    Condition VARCHAR(50),
    Brand VARCHAR(100),
    Size VARCHAR(50),
    Weight DECIMAL(10,2),
    Price DECIMAL(10,2) NOT NULL,
    Stock INTEGER NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE ItemImages (
    ImageID SERIAL PRIMARY KEY,
    ItemID INTEGER REFERENCES Items(ItemID) ON DELETE CASCADE,
    ImageURL VARCHAR(255) NOT NULL
);

CREATE TABLE ItemTags (
    ItemID INTEGER REFERENCES Items(ItemID) ON DELETE CASCADE,
    Tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (ItemID, Tag)
);


CREATE TABLE ProductData (
    ProductID SERIAL PRIMARY KEY,
    ItemID INTEGER REFERENCES Items(ItemID) ON DELETE CASCADE,
    OfficialCode VARCHAR(100),
    AdditionalInfo TEXT
);

CREATE TABLE Transactions (
    TransactionID SERIAL PRIMARY KEY,
    BuyerID INTEGER REFERENCES Users(UserID),
    SellerID INTEGER REFERENCES Users(UserID),
    ItemID INTEGER REFERENCES Items(ItemID),
    Quantity INTEGER NOT NULL,
    TotalPrice DECIMAL(10,2) NOT NULL,
    Status VARCHAR(50) NOT NULL, -- e.g., 'Buying', 'Canceled', 'Finished'
    TrackingNumber VARCHAR(100),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE Payments (
    PaymentID SERIAL PRIMARY KEY,
    UserID INTEGER REFERENCES Users(UserID),
    TransactionID INTEGER REFERENCES Transactions(TransactionID),
    Amount DECIMAL(10,2) NOT NULL,
    PaymentMethod VARCHAR(50), -- e.g., 'PayPal', 'Visa', 'MasterCard'
    PaymentType VARCHAR(50), -- e.g., 'Charge', 'Withdrawal', 'Purchase', 'Sale'
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE ChatLogs (
    ChatID SERIAL PRIMARY KEY,
    SenderID INTEGER REFERENCES Users(UserID),
    ReceiverID INTEGER REFERENCES Users(UserID),
    Message TEXT NOT NULL,
    SentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE ShoppingCart (
    CartID SERIAL PRIMARY KEY,
    UserID INTEGER REFERENCES Users(UserID) ON DELETE CASCADE,
    ItemID INTEGER REFERENCES Items(ItemID),
    Quantity INTEGER NOT NULL,
    AddedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE AdminActions (
    ActionID SERIAL PRIMARY KEY,
    AdminID INTEGER REFERENCES Users(UserID),
    AffectedUserID INTEGER,
    AffectedItemID INTEGER,
    ActionType VARCHAR(50), -- e.g., 'BlockUser', 'DeleteItem'
    ActionDetails TEXT,
    ActionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Claims (
    ClaimID SERIAL PRIMARY KEY,
    UserID INTEGER REFERENCES Users(UserID),
    Subject VARCHAR(255) NOT NULL,
    Description TEXT NOT NULL,
    Status VARCHAR(50) DEFAULT 'Open', -- e.g., 'Open', 'Resolved'
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);






