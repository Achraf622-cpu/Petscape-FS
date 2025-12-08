package com.petscape.service;

import org.springframework.web.multipart.MultipartFile;

public interface IFileStorageService {
    String store(MultipartFile file, String subdirectory);

    void delete(String relativePath);
}
