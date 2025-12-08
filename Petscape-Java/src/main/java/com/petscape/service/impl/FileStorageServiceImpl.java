package com.petscape.service.impl;

import com.petscape.service.IFileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageServiceImpl implements IFileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public String store(MultipartFile file, String subdirectory) {
        try {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path directory = Paths.get(uploadDir, subdirectory);
            Files.createDirectories(directory);
            Files.copy(file.getInputStream(), directory.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            return subdirectory + "/" + filename;
        } catch (IOException e) {
            log.error("Failed to store file: {}", e.getMessage());
            throw new RuntimeException("Could not store file. Please try again.", e);
        }
    }

    @Override
    public void delete(String relativePath) {
        try {
            Files.deleteIfExists(Paths.get(uploadDir, relativePath));
        } catch (IOException e) {
            log.warn("Could not delete file {}: {}", relativePath, e.getMessage());
        }
    }
}
