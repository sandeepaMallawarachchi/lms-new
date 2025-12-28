package com.learning.system.service;

import com.learning.system.config.FileStorageConfig;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class FileStorageService {

    private final FileStorageConfig fileStorageConfig;

    public FileStorageService(FileStorageConfig fileStorageConfig) {
        this.fileStorageConfig = fileStorageConfig;
    }

    public String storeFile(MultipartFile file) throws IOException {
        // Get original filename and replace spaces with hyphens
        String originalFilename = file.getOriginalFilename();
        String sanitizedFilename = originalFilename != null ?
                originalFilename.replace(" ", "-") :
                UUID.randomUUID().toString();

        // Generate unique filename
        String fileName = UUID.randomUUID().toString() + "_" + sanitizedFilename;

        // URL encode the filename
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8.toString())
                .replace("+", "%20");

        Path uploadPath = Paths.get(fileStorageConfig.getUploadDir());

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        return fileStorageConfig.getAccessUrl() + "/" + encodedFileName;
    }
}