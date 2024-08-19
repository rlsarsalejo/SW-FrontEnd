import { createBrowserRouter } from "react-router-dom";
import Homepage from '../pages/index'
import PagenotFound from "../views/PagenotFound";
const router = createBrowserRouter([
    {
        path: '/',
        element: <Homepage />
    },
    {
        path: '*',
        element: <PagenotFound />
    }
])

export default router;