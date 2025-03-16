import { ICommunityForm } from "@/types/types";
import { FileIcon, FileWarning, Loader, ShieldAlert, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";




// Initialize the form data
const initialFormData: ICommunityForm = {
    name: '',
    description: '',
    profileImage: '',
    profileImageParams: '',
    bannerImage: '',
    bannerImageParams: '',

};

export function CommunityCreationForm() {
    const [formData, setFormData] = useState<ICommunityForm>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorCharacter, setErrorCharacter] = useState<string>('');
    const [profileImageLoading, setProfileImageLoading] = useState(false);
    const [profileImageError, setProfileImageError] = useState('')
    const [bannerImageLoading, setBannerImageLoading] = useState(false);
    const [bannerImageError, setBannerImageError] = useState('')
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    useEffect(() => {
        console.log(formData);
    }, [formData]);


    function validateValues(data: ICommunityForm) {
        if (!data.name) {
            setIsError(true);
            setErrorCharacter('Name is required');
            return false;
        }
        if (!data.description) {
            setIsError(true);
            setErrorCharacter('Description is required');
            return false;
        }
        if (!data.profileImage) {
            setIsError(true);
            setErrorCharacter('Profile Image is required');
            return false;
        }
        if (!data.profileImageParams) {
            setIsError(true);
            setErrorCharacter('Profile Image Params is required');
            return false;
        }
        return true
    }

    async function handleFormSubmit(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        const isValid = validateValues(formData)
        if (!isValid) return;
        setIsSubmitting(true);
        setIsError(false);
        console.log(formData);
        const url = `${import.meta.env.VITE_SERVER_URL}/api/v1/createNewCommunity`;
        const newFormData = {
            name: formData.name,
            description: formData.description,
            profileImageParams: formData.profileImageParams,
            bannerImageParams: formData.bannerImageParams,
        }
        try {
            const response = await axios.post(url, newFormData);
            if (response.status === 201) {
                console.log(response.data);
                setIsSubmitting(false);
                toast({
                    title: 'Community Created Successfully',
                    description: 'Community has been created successfully',
                    variant: 'success'
                })
            }
        } catch (error: any) {
            console.error(error);
            setIsError(true);
            setErrorCharacter(error.message);
            setIsSubmitting(false);
            toast({
                title: 'Error Creating Community',
                description: 'Error creating community. Please try again',
                variant: 'destructive'
            })
        }

    }

    // Handle profile image upload
    const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const file = e.target.files?.[0];
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
    };

    const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const file = e.target.files?.[0];
        if (file) {
            setBannerImageLoading(true)
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
                    setFormData((prev) => ({ ...prev, bannerImage: publicUrl, bannerImageParams: params }))
                }
                else {
                    setBannerImageError('Error Uploading File ! Try Uploading Again !')
                }
                setBannerImageLoading(false)
            }
        }
    };




    return (
        <div className="p-4">
            {/* error */}
            {
                isError && (
                    <div className="w-full my-2  bg-red-200 border-2 border-red-600 flex items-center p-2 rounded-md gap-3">
                        <ShieldAlert color="#ff0000" />
                        <p className="text-red-600 font-bold py-2">{errorCharacter}</p>
                    </div>
                )
            }
            <form className="flex flex-col items-start">
                <div className="flex w-full flex-col items-start">
                    <label htmlFor="name" className="text-lg font-semibold text-left">Community Name</label>
                    <input type="text" id="name" placeholder="Enter community name" className="border border-slate-300 rounded-md p-2 w-full" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>


                <div className="flex flex-col items-start w-full">
                    <label htmlFor="description" className="text-lg font-semibold text-left">Description</label>
                    <textarea id="description" placeholder="Enter community description" className="border border-slate-300 rounded-md w-full p-2" onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <div className="mt-1 flex items-start  w-full flex-col">
                    <label htmlFor="description" className="text-lg font-semibold text-left">Upload Profile Image</label>
                    <div className="flex items-start w-full">
                        {/* Custom file upload button */}
                        <Button variant="outline" size="lg" className=" w-full bg-gray-50 border-2 border-gray-200 hover:bg-teal-50 hover:border-yellow">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Profile Image
                        </Button>

                        {/* Display loading and image preview */}
                        {profileImageLoading ? (
                            <span className="ml-2 mt-2 text-sm text-gray-400 flex-col items-center">
                                <div className="flex gap-2">
                                    <div className="animate-spin">
                                        <Loader />
                                    </div>
                                    <div className="text-xs">Uploading...</div>
                                </div>
                            </span>
                        ) : formData.profileImage ? (
                            <img
                                src={formData.profileImage}
                                alt="profile"
                                className="w-20 rounded-full h-20 border-2 border-slate-300 ml-2"
                            />
                        ) : null}
                    </div>

                    {/* Hidden file input */}
                    <input
                        type="file"
                        id="profileImage"
                        accept="image/*"
                        className="absolute mt-6 opacity-0 w-fit h-11 cursor-pointer"
                        onChange={handleProfileImageUpload}
                    />
                </div>





                <div className="mt-1 flex items-start  w-full flex-col">
                    <label htmlFor="description" className="text-lg font-semibold text-left">Upload Banner Image</label>
                    <div className="flex items-start flex-col gap-3 w-full">
                        {/* Custom file upload button */}
                        <Button variant="outline" size="lg" className=" w-full bg-gray-50 border-2 border-gray-200 hover:bg-teal-50 hover:border-yellow">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Banner Image
                        </Button>

                        {/* Display loading and image preview */}
                        {bannerImageLoading ? (
                            <span className=" mt-2 text-sm text-gray-400 flex-col items-center">
                                <div className="flex gap-2">
                                    <div className="animate-spin">
                                        <Loader />
                                    </div>
                                    <div className="text-xs">Uploading...</div>
                                </div>
                            </span>
                        ) : formData.bannerImage ? (
                            <img
                                src={formData.bannerImage}
                                alt="profile"
                                className="w-full h-20 rounded-md border-2 border-slate-300"
                            />
                        ) : null}
                    </div>

                    {/* Hidden file input */}
                    <input
                        type="file"
                        id="profileImage"
                        accept="image/*"
                        className="absolute mt-6 opacity-0 w-fit h-11 cursor-pointer"
                        onChange={handleBannerImageUpload}
                    />
                </div>


                <Button variant="orangeGradient" className="mt-4 w-full" onClick={handleFormSubmit}>
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <Loader />
                            <span>Creating Community...</span>
                        </div>
                    ) : (
                        <span>Create Community</span>
                    )}
                </Button>

            </form>



        </div>
    )


}
