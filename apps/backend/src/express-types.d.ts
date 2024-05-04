declare namespace CookieSessionInterfaces {
    interface CookieSessionObject {
      user?: {
        id: string; 
        username: string; 
        logStatus: boolean; 
      }
    }
  }

  // extend session object interface to include properties 