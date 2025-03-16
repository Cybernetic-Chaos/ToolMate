import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  Paintbrush,
  Users,
  Tag,
  MapPin,
  Globe,
  Hammer,
  Scissors,
  PenTool,
  Image as ImageIcon,
  FileImage,
  Wrench,
  Loader
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import axios from 'axios'
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    window.addEventListener("resize", listener)
    return () => window.removeEventListener("resize", listener)
  }, [matches, query])

  return matches
}


const formSteps = [
  {
    title: "Craft Your Space",
    icon: <Paintbrush className="w-6 h-6" />,
    fields: [
      { name: "communityName", label: "Community Name", type: "input", icon: <PenTool className="w-4 h-4" />, },
      { name: "description", label: "Description", type: "textarea", icon: <Scissors className="w-4 h-4" /> },
      { name: "profileImage", label: "Profile Image", type: "file", icon: <ImageIcon className="w-4 h-4" /> },
      { name: "bannerImage", label: "Banner Image", type: "file", icon: <FileImage className="w-4 h-4" /> },
    ],
  },
  {
    title: "Build Your Community",
    icon: <Users className="w-6 h-6" />,
    fields: [
      { name: "tags", label: "Tags", type: "input", icon: <Tag className="w-4 h-4" /> },
      { name: "city", label: "City (Optional)", type: "input", icon: <MapPin className="w-4 h-4" /> },
      { name: "country", label: "Country (Optional)", type: "input", icon: <Globe className="w-4 h-4" /> },
    ],
  },
  {
    title: "Final Touches",
    icon: <Hammer className="w-6 h-6" />,
    fields: [
      { name: "sponsored", label: "Sponsored", type: "switch", icon: <Tag className="w-4 h-4" /> },
    ],
  },
]

export default function DIYCommunityCreationDialog({
  collabsable = false,
}: {
  collabsable?: boolean
}) {
  const [step, setStep] = useState(1)
  const [open, setOpen] = useState(false)
  const [direction, setDirection] = useState(0)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const [profileImageLoading, setProfileImageLoading] = useState(false)
  const [bannerImageLoading, setBannerImageLoading] = useState(false)

  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImageError, setProfileImageError] = useState<string | null>(null)
  const [bannerImageError, setBannerImageError] = useState<string | null>(null)

  const [formData, setFormData] = useState({})

  const inputRef = useRef<HTMLInputElement | null>(null);



  useEffect(() => {
    console.log(formData)
  }, [formData])

  const getValue = (name: string) => formData[name] || ""
  async function handleProfileImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImageLoading(true)
      console.log("loading...")
      const url = `${import.meta.env.VITE_SERVER_URL}/api/v1/get-s3-presigned-url`
      const fileName = file.name;
      const fileType = file.type;

      const response = await axios.post(url, { filename: fileName, fileType: fileType });
      if (response.status === 200) {
        const preSignedUrl = response.data
        const params = preSignedUrl.params
        console.log(response.data, 'server')
        const uploadedFile = await axios.put(preSignedUrl.url, file, {
          headers: {
            'Content-Type': fileType,
          },
        })
        console.log(uploadedFile);
        if (uploadedFile.status === 200) {
          const publicUrl = response.data.publicUrl
          console.log(publicUrl)
          setFormData((prev) => ({ ...prev, profileImage: publicUrl, profileImageParams: params }))
        }
        else {
          setProfileImageError('Error Uploading File ! Try Uploading Again !')
        }
        setProfileImageLoading(false)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Optionally, set focus back to the input if it gets lost
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  async function handleBannerImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setBannerImageLoading(true)
      console.log("loading...")
      const url = `${import.meta.env.VITE_SERVER_URL}/api/v1/get-s3-presigned-url`
      const fileName = file.name;
      const fileType = file.type;

      const response = await axios.post(url, { filename: fileName, fileType: fileType });
      if (response.status === 200) {
        const preSignedUrl = response.data
        console.log(response.data, 'server')
        const uploadedFile = await axios.put(preSignedUrl.url, file, {
          headers: {
            'Content-Type': fileType,
          },
        })
        console.log(uploadedFile);
        if (uploadedFile.status === 200) {
          const publicUrl = response.data.publicUrl
          console.log(publicUrl)
          setFormData((prev) => ({ ...prev, bannerImage: publicUrl, bannerImageParams: response.params }))
        }
        else {
          setBannerImageError('Error Uploading File ! Try Uploading Again !')
        }
        setBannerImageLoading(false)
      }
    }
  }

  const totalSteps = formSteps.length

  const nextStep = () => {
    setDirection(1)
    setStep(prev => Math.min(prev + 1, totalSteps))
  }

  const prevStep = () => {
    setDirection(-1)
    setStep(prev => Math.max(prev - 1, 1))
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }


  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-4">
        {formSteps.map((formStep, index) => (
          <div
            key={index}
            className={`flex flex-col items-center ${index + 1 <= step ? 'text-yellow-600' : 'text-gray-400'
              }`}
          >
            <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center mb-2 ${index + 1 <= step ? 'border-yellow bg-paleYellow' : 'border-slate-300 bg-slate-100'
              }`}>
              {formStep.icon}
            </div>
            <div className="text-md font-medium text-center">{formStep.title}</div>
          </div>
        ))}
      </div>
      <div className="relative">
        <div className="overflow-hidden h-3 mb-4 text-md flex rounded-full bg-slate-200">
          <motion.div
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow"
            initial={{ width: '0%' }}
            animate={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  )

  const FormContent = () => (
    <div className="mt-4">
      <ProgressBar />
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "tween", duration: 0.5 }}
        >
          <div className="space-y-6">
            {formSteps[step - 1].fields.map((field, index) => (
              <div key={index} className="relative">
                <Label htmlFor={field.name} className="flex items-center text-lg font-medium mb-2">
                  {field.icon}
                  <span className="ml-2">{field.label}</span>
                </Label>
                {field.type === 'input' && (

                  <Input
                    ref={inputRef} // Use ref here
                    id={field.name}
                    name={field.name}
                    value={getValue(field.name)}
                    onChange={handleChange}
                  />
                )}

                {field.type === 'textarea' && (
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={getValue(field.name)} // Controlled textarea value
                    onChange={handleChange} // Change handler
                  />
                )}

                {field.type === 'file' && (
                  <div className="mt-1 flex items-center">
                    <Button variant="outline" size="lg" className="bg-gray-50 border-2 border-gray-200 hover:bg-teal-50 hover:border-yellow">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload {field.label}
                    </Button>
                    {
                      field.name === "profileImage"
                        ? (profileImageLoading ?
                          <span className="ml-2 text-sm text-gray-400">
                            <div className='flex gap-2'>
                              <div className="animate-spin ">
                                <Loader />
                              </div>
                              <div className="text-xs">Uploading...</div>
                            </div>
                          </span> : (
                            formData.profileImage ? <img
                              src={formData.profileImage}
                              alt="profile"
                              className="w-20 h-20 border-2 border-slate-600 rounded-md ml-2"
                            /> : null
                          )) : (
                          bannerImageLoading ?
                            <span className="ml-2 text-sm text-gray-400">
                              <div className='flex gap-2'>
                                <div className="animate-spin ">
                                  <Loader />
                                </div>
                                <div className="text-xs">Uploading...</div>
                              </div>
                            </span> : (
                              formData.bannerImage ? <img
                                src={formData.bannerImage}
                                alt="banner"
                                className="w-36 h-20 border-2 border-slate-600   rounded-md ml-2"
                              /> : null
                            )
                        )
                    }
                    <input
                      type="file"
                      id={field.name}
                      accept='image/*'
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                      onChange={(e) => {
                        if (field.name === "profileImage") {
                          handleProfileImageUpload(e)
                        } else if (field.name === "bannerImage") {
                          handleBannerImageUpload(e)
                        }
                      }}
                    />
                  </div>
                )}
                {field.type === 'radio' && (
                  <RadioGroup defaultValue="public" className="flex space-x-4">
                    {field.options?.map((option) => (
                      <div key={option} className="flex items-center space-x-2 bg-gray-50 border-2 border-gray-200 rounded-md p-3 hover:bg-teal-50 hover:border-yellow">
                        <RadioGroupItem value={option.toLowerCase()} id={option.toLowerCase()} />
                        <Label htmlFor={option.toLowerCase()}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                {field.type === 'switch' && (
                  <div className="flex items-center space-x-2 bg-gray-50 border-2 border-gray-200 rounded-md p-3">
                    <Switch id={field.name} />
                    <Label htmlFor={field.name}>{field.label}</Label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-8 flex justify-between">
        <Button
          onClick={prevStep}
          disabled={step === 1}
          variant="outline"
          size="lg"
          className="bg-gray-50 border-2 border-gray-200 hover:bg-teal-50 hover:border-yellow"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={step === totalSteps ? () => { } : nextStep}
          size="lg"
          className="bg-yellow text-black hover:bg-softYellow"
        >
          {step === totalSteps ? 'Create Community' : 'Next'}
          {step !== totalSteps && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {isMobile ? (
        <Drawer>
          <DrawerTrigger asChild>
            <button>
              <img
                src="/assets/matey-emoji/newComm.svg"
                alt="new chat"
                className="p-1 bg-mangoYellow hover:bg-softYellow rounded-lg w-14 h-14 cursor-pointer"
              />
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Create Your DIY Community</DrawerTitle>
            </DrawerHeader>
            <div className="p-6">
              <FormContent />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <TooltipProvider>
            <Tooltip delayDuration={70}>
              <TooltipTrigger className={`${collabsable ? "block" : "hidden"}`}>
                <button onClick={() => setOpen(!open)} className={`${collabsable ? "flex" : "hidden"} mt-1`}>
                  <img
                    src="/assets/matey-emoji/newComm.svg"
                    alt="new chat"
                    className="p-1 bg-mangoYellow hover:bg-softYellow rounded-lg w-14 h-14 cursor-pointer"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-paleYellow">
                <p>Create New Community</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>


          <button onClick={() => setOpen(!open)} className={`${collabsable ? "hidden" : "flex"}  mt-1  gap-3 items-center bg-mangoYellow px-3 rounded-lg hover:bg-softYellow transition duration-300 ease-in-out`}>
            <img src="/assets/matey-emoji/newComm.svg" alt="new chat" className="w-12 h-12" />
            <p className="font-semibold">New Community</p>
          </button>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Your DIY Community</DialogTitle>
            </DialogHeader>
            <FormContent />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
