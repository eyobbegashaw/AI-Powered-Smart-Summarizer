import sys
import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# 1. የፕሮጀክቱን root ፎልደር ወደ path መጨመር (ModuleNotFoundError እንዳይመጣ)
sys.path.append(os.getcwd())

# 2. የፕሮጀክቱን ሞዴሎች Import አድርግ (ይህ ለ autogenerate የግድ ነው)
try:
    from app.core.database import Base
    target_metadata = Base.metadata
except ImportError:
    print("Warning: Could not import app.db.base. Ensure your folder structure is correct.")
    target_metadata = None

# Alembic Config object
config = context.config

# 3. የዳታቤዝ አድራሻውን እዚህ ጋር አስተካክል
config.set_main_option("sqlalchemy.url", "postgresql://postgres:eyobbegashaw1121@localhost:5432/summarizer_db")

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    # እዚህ ጋር አሁን engine_from_config በትክክል ይሰራል
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()