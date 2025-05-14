use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone)]
struct Policy {
    id: String,
    name: String,
    rules: Vec<String>,
    is_active: bool,
}

// New struct for policy creation payload, without the 'id' field
#[derive(Serialize, Deserialize)]
struct CreatePolicyPayload {
    name: String,
    rules: Vec<String>,
    is_active: bool,
}

struct AppState {
    policies: Mutex<Vec<Policy>>,
}

#[derive(Serialize, Deserialize)]
struct EvaluationRequest {
    context: String,
}

#[actix_web::get("/health")]
async fn health_check() -> impl Responder {
    log::info!("Health check endpoint called");
    HttpResponse::Ok().json(serde_json::json!({
        "status": "ok",
        "service": "Policy Enforcement Service",
        "version": env!("CARGO_PKG_VERSION")
    }))
}

#[actix_web::get("/policies")]
async fn get_policies(data: web::Data<AppState>) -> impl Responder {
    log::info!("Get all policies endpoint called");
    let policies = data.policies.lock().unwrap();
    HttpResponse::Ok().json(policies.to_vec())
}

// Modified create_policy to use CreatePolicyPayload
#[actix_web::post("/policies")]
async fn create_policy(payload: web::Json<CreatePolicyPayload>, data: web::Data<AppState>) -> impl Responder {
    log::info!("Create policy endpoint called with: {:?}", payload.name);
    let mut policies = data.policies.lock().unwrap();
    let new_policy = Policy {
        id: Uuid::new_v4().to_string(),
        name: payload.name.clone(),
        rules: payload.rules.clone(),
        is_active: payload.is_active,
    };
    policies.push(new_policy.clone());
    log::info!("Policy created successfully: {}", new_policy.id);
    HttpResponse::Created().json(new_policy)
}

async fn get_policy_by_id_handler(policy_id: web::Path<String>, data: web::Data<AppState>) -> impl Responder {
    log::info!("Get policy by ID endpoint called for: {}", policy_id);
    let policies = data.policies.lock().unwrap();
    if let Some(policy) = policies.iter().find(|p| p.id == *policy_id) {
        HttpResponse::Ok().json(policy.clone())
    } else {
        log::warn!("Policy not found: {}", policy_id);
        HttpResponse::NotFound().json(serde_json::json!({
            "error": "Policy not found",
            "policy_id": policy_id.to_string()
        }))
    }
}

async fn evaluate_policy_handler(req: web::Json<EvaluationRequest>, data: web::Data<AppState>) -> impl Responder {
    log::info!("Evaluate policy endpoint called with: {:?}", req.context);
    // In a real scenario, this would parse the request, find relevant policies,
    // and evaluate them against the request context.
    // The 'data' argument is unused here, but kept for consistency with other handlers
    // and potential future use where policies might be fetched from AppState.
    let _ = data; // Explicitly mark data as unused for now to avoid warnings if not used.
    HttpResponse::Ok().json(serde_json::json!({
        "decision": "Permit",
        "reason": "Policy evaluation is a placeholder."
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));
    log::info!("Starting Policy Enforcement Service...");

    let app_state = web::Data::new(AppState {
        policies: Mutex::new(vec![]),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .service(health_check)
            .service(get_policies)
            .service(create_policy)
            .route("/policies/{policy_id}", web::get().to(get_policy_by_id_handler))
            .route("/evaluate", web::post().to(evaluate_policy_handler))
    })
    .bind(("0.0.0.0", 8003))?
    .run()
    .await
}

