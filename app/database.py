from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database file will be created as "compliance.db" in your project folder
SQLALCHEMY_DATABASE_URL = "sqlite:///./compliance.db"

# connect_args is needed only for SQLite, to allow multiple threads to use the same connection
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# SessionLocal is what you'll use in each request to talk to the DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is the parent class every table model will inherit from
Base = declarative_base()

