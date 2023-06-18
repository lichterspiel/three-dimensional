import { API_BASE_URL } from "./statics";

 export async function getCsrfToken(){
    let csrfToken = ''
    let rq =  await fetch(`${API_BASE_URL}/getcsrf`, {
      credentials: "include",
    })
    csrfToken = rq.headers.get("X-CSRFToken")!;

    return csrfToken
  };

