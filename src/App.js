import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import Header from "./components/Header";
import Body from "./components/Body";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
//  ✅ createBrowserRouter will create routing configuration for us
//  ✅ RouterProvider actually provide this routing configuration to our app
import About from "./components/About";
import Contact from "./components/Contact";
import RestaurantMenu from "./components/RestaurantMenu";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";
import Cart from "./components/Cart";
import Payment from "./components/Payment";
import ErrorPage from "./components/Error";
import MealPlanner from "./components/MealPlanner";
import FlickBot from "./components/FlickBot";

const Grocery = lazy(() => import("./components/Grocery"));




const AppLayout = () => {
  return (
    <Provider store={appStore}>
      <div className="app min-h-screen bg-gray-50 text-gray-800">
        <Header />
        <Outlet />
        <FlickBot />
      </div>
    </Provider>
  );
};




//  ✅  here we are creating routing configuration
const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Body />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/grocery",
        element: (
          <Suspense fallback={<h1>Loading.....</h1>}>
            <Grocery />
          </Suspense>
        ),
      },
      {
        path: "/restaurant/:resId",
        element: <RestaurantMenu />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/payment",
        element: <Payment />,
      },
      {
        path: "/planner",
        element: <MealPlanner />,
      },
    ],
    errorElement: <ErrorPage />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={appRouter} />);
