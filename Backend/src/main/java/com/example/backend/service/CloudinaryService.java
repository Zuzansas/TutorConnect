package com.example.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import com.example.backend.model.exception.CloudinaryException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {
    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file, String folder) {
        try {
            Map<String, Object> uploadParams = new HashMap<>();
            uploadParams.put("folder", folder);
            uploadParams.put("resource_type", "image");
            uploadParams.put("transformation", new Transformation()
                    .width(800)
                    .height(800)
                    .crop("limit")
                    .quality("auto")
                    .fetchFormat("auto"));

            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    uploadParams);

            String imageUrl = (String) uploadResult.get("secure_url");
            return imageUrl;

        } catch (IOException e) {
            throw new CloudinaryException("Nie udało się przesłać obrazu: " + e.getMessage());
        }
    }

    public void deleteImage(String imageUrl) {
        try {
            String publicId = extractPublicId(imageUrl);
            if (publicId != null && !publicId.isEmpty()) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (IOException ignored) {
        }
    }

    private String extractPublicId(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return null;
        }

        try {
            String[] parts = imageUrl.split("/upload/");
            if (parts.length < 2) {
                return null;
            }

            String afterUpload = parts[1];
            String withoutVersion = afterUpload.replaceFirst("v\\d+/", "");
            int lastDot = withoutVersion.lastIndexOf('.');
            if (lastDot > 0) {
                return withoutVersion.substring(0, lastDot);
            }

            return withoutVersion;
        } catch (Exception e) {
            return null;
        }
    }
}
