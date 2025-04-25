pub mod parser;
pub mod validator;
pub mod models;

pub use models::AltFile;
pub use parser::parse_alt_file;
pub use validator::validate_alt_file;
