-- Create atlas_archive database if it doesn't exist
CREATE DATABASE atlas_archive;

-- Grant privileges to atlas_user
GRANT ALL PRIVILEGES ON DATABASE atlas_archive TO atlas_user;
GRANT ALL PRIVILEGES ON DATABASE atlas_user TO atlas_user;
