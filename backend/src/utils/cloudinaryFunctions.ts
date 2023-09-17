import * as cloudinary from 'cloudinary';
import streamifier from 'streamifier';

//@ts-ignore
cloudinary.config({ 
    cloud_name: 'dgo6vnzjl', 
    api_key: '361661967648963', 
    api_secret: 'kJmIuSe3_miAAzMT0FEFIZ2aQq8',
    secure: true 
});

export function uploadFileToCloudinary(file: any, isVideoPoster: boolean = false, isProfilePicture: boolean = false) {
    return new Promise((resolve, reject) => {
        let cld_upload_stream = cloudinary.v2.uploader.upload_stream(
            {
                resource_type: file.mimetype.startsWith('image') ? 'image' : 'video',
                folder: isProfilePicture ? 
                    'instagram/profile_picture' :
                    isVideoPoster ? 
                    'instagram/poster_video' : 
                    file.mimetype.startsWith('image') ? 
                    'instagram/images' : 
                    'instagram/videos',
            },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    console.log(error);
                    reject(error);
                }
            }
        );

        streamifier.createReadStream(file.data).pipe(cld_upload_stream);

        // Handle errors from the Cloudinary upload_stream
        cld_upload_stream.on('error', (error) => {
            console.log(error);
            reject(error);
        });
    });
}

export function deleteOldProfilePicture(file: string) {
    let result = cloudinary.v2.uploader.destroy('sample', function(result) { return true; });
    return result;
}