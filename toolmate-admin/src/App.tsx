import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from './pages/_public/PublicLayout';
import LogIn from './pages/_public/page/Login';
import PrivateLayout from './pages/_privata/PrivateLayout';
import Dashboard from './pages/_privata/page/AddProductForm';
import AddProductForm from './pages/_privata/page/AddProductForm';
import { Toaster } from "@/components/ui/toaster"
function App() {
  return (
     <div className='h-screen w-screen'>
       <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route path="/login" element={<LogIn />} />
        </Route>
        <Route element={<PrivateLayout />}>
          <Route path='/dashboard' element={<AddProductForm />} />
          <Route path='/add-product' element={<AddProductForm />} />
        </Route>
      </Routes>
      <Toaster />

     </div>

  )
}

export default App;