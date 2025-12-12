import { useThemeStore } from "../store/useThemeStore";
import { LoaderIcon} from 'lucide-react'

const PageLoader = () => {

  const {theme} = useThemeStore();

  return (
    <div className=' min-h-screen flex justify-center items-center' data-theme={theme}>
        <LoaderIcon className='animate-spin size-10 text-primary '/>
    </div>
  )
}

export default PageLoader