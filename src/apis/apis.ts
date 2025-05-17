import { ApiHandlers, ApiHandlerContext } from "./types";
import * as chat from "./chat/server";
import * as clearCache from "./settings/clearCache/server";
import * as auth from "./auth/server";
import { activityApiHandlers } from "./activity/server";
import { predefinedDataApiHandlers } from "./predefinedData/server";
import { wellnessMetricsApiHandlers } from "./wellnessMetrics/server";
import { trackedActivitiesApiHandlers } from "./trackedActivities/server";

// Cast each handler in activityApiHandlers to the generic signature
const typedActivityApiHandlers = Object.entries(activityApiHandlers).reduce(
  (acc, [key, handler]) => {
    acc[key] = {
      process: handler.process as (params: unknown, context: ApiHandlerContext) => Promise<unknown>,
    };
    return acc;
  },
  {} as ApiHandlers
);

// Cast predefinedDataApiHandlers similarly
const typedPredefinedDataApiHandlers = Object.entries(predefinedDataApiHandlers).reduce(
  (acc, [key, handler]) => {
    acc[key] = {
      process: handler.process as (params: unknown, context: ApiHandlerContext) => Promise<unknown>,
    };
    return acc;
  },
  {} as ApiHandlers
);

// Cast wellnessMetricsApiHandlers similarly
const typedWellnessMetricsApiHandlers = Object.entries(wellnessMetricsApiHandlers).reduce(
  (acc, [key, handler]) => {
    acc[key] = {
      process: handler.process as (params: unknown, context: ApiHandlerContext) => Promise<unknown>,
    };
    return acc;
  },
  {} as ApiHandlers
);

// Cast trackedActivitiesApiHandlers similarly
const typedTrackedActivitiesApiHandlers = Object.entries(trackedActivitiesApiHandlers).reduce(
  (acc, [key, handler]) => {
    acc[key] = {
      process: handler.process as (params: unknown, context: ApiHandlerContext) => Promise<unknown>,
    };
    return acc;
  },
  {} as ApiHandlers
);

export const apiHandlers: ApiHandlers = {
  [chat.name]: { process: chat.process as (params: unknown, context: ApiHandlerContext) => Promise<unknown> },
  [clearCache.name]: { process: clearCache.process as (params: unknown, context: ApiHandlerContext) => Promise<unknown> },
  [auth.login]: { process: auth.loginUser as (params: unknown, context: ApiHandlerContext) => Promise<unknown> },
  [auth.register]: { process: auth.registerUser as (params: unknown, context: ApiHandlerContext) => Promise<unknown> },
  [auth.me]: { process: auth.getCurrentUser as (params: unknown, context: ApiHandlerContext) => Promise<unknown> },
  [auth.logout]: { process: auth.logoutUser as (params: unknown, context: ApiHandlerContext) => Promise<unknown> },
  [auth.updateProfile]: { process: auth.updateUserProfile as (params: unknown, context: ApiHandlerContext) => Promise<unknown> },
  ...typedActivityApiHandlers, // Spread the typed activity handlers
  ...typedPredefinedDataApiHandlers, // Spread new typed handlers
  ...typedWellnessMetricsApiHandlers, // Spread new typed handlers
  ...typedTrackedActivitiesApiHandlers, // Add new TYPED tracked activities handlers
};


