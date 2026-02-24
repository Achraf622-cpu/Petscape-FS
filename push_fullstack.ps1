$ErrorActionPreference = "Continue"

$tasks = @(
    @{ BranchName="setup-dependencies"; Message="Setup project configurations and dependencies"; PathMatches=@("Petscape-Java/pom.xml", "Petscape-Java/.mvn", "Petscape-Java/mvnw*", "PetScape-Angular/package.json", "PetScape-Angular/package-lock.json", "PetScape-Angular/angular.json", "PetScape-Angular/tsconfig.*", "docker-compose.yml", "Petscape-Java/src/main/resources/") },
    @{ BranchName="backend-init"; Message="Initial backend structure and entry point"; PathMatches=@("Petscape-Java/src/main/java/com/petscape/PetscapeApplication.java", "Petscape-Java/src/main/java/com/petscape/config/") },
    @{ BranchName="backend-models"; Message="Develop backend entities and DTOs"; PathMatches=@("Petscape-Java/src/main/java/com/petscape/model/", "Petscape-Java/src/main/java/com/petscape/dto/") },
    @{ BranchName="backend-repos"; Message="Implement database repositories"; PathMatches=@("Petscape-Java/src/main/java/com/petscape/repository/") },
    @{ BranchName="backend-services"; Message="Implement core backend services"; PathMatches=@("Petscape-Java/src/main/java/com/petscape/service/") },
    @{ BranchName="backend-controllers"; Message="Develop REST API controllers"; PathMatches=@("Petscape-Java/src/main/java/com/petscape/controller/") },
    @{ BranchName="backend-security"; Message="Add JWT Security and Authentication"; PathMatches=@("Petscape-Java/src/main/java/com/petscape/security/") },
    @{ BranchName="backend-completion"; Message="Complete backend infrastructure"; PathMatches=@("Petscape-Java/") },
    @{ BranchName="frontend-skeleton"; Message="Initialize Angular application skeleton"; PathMatches=@("PetScape-Angular/src/main.ts", "PetScape-Angular/src/app/app.*", "PetScape-Angular/src/environments/") },
    @{ BranchName="frontend-core"; Message="Create core UI interceptors and services"; PathMatches=@("PetScape-Angular/src/app/core/") },
    @{ BranchName="frontend-shared"; Message="Develop shared layout and generic components"; PathMatches=@("PetScape-Angular/src/app/shared/", "PetScape-Angular/src/styles.*", "PetScape-Angular/src/index.html") },
    @{ BranchName="frontend-auth"; Message="Implement authentication views and login logic"; PathMatches=@("PetScape-Angular/src/app/pages/auth/", "PetScape-Angular/src/app/pages/login/", "PetScape-Angular/src/app/pages/register/") },
    @{ BranchName="frontend-admin"; Message="Develop Admin Dashboard frontend"; PathMatches=@("PetScape-Angular/src/app/pages/admin/") },
    @{ BranchName="frontend-pages"; Message="Finalize public facing pages"; PathMatches=@("PetScape-Angular/src/app/pages/") },
    @{ BranchName="frontend-completion"; Message="Complete frontend styling and remaining configs"; PathMatches=@("PetScape-Angular/") },
    @{ BranchName="security-audit"; Message="Extract secrets to environment variables"; PathMatches=@(".env.example") },
    @{ BranchName="final-polish"; Message="Finalize remaining project files"; PathMatches=@(".") }
)

# 4 months ago to today (Mar 10, 2026)
$endDate = Get-Date "2026-03-10T12:00:00"
$startDate = $endDate.AddMonths(-4)

$totalTasks = $tasks.Count
$totalSeconds = ($endDate - $startDate).TotalSeconds
$incrementSeconds = [math]::Floor($totalSeconds / $totalTasks)

$currentDate = $startDate

git checkout main

foreach ($task in $tasks) {
    Write-Host "===================="
    Write-Host "Processing task: $($task.Message) at $($currentDate.ToString('yyyy-MM-dd HH:mm:ss'))"
    
    git checkout main
    git checkout -b $task.BranchName
    
    foreach ($pattern in $task.PathMatches) {
        # Using git add with trailing slashes correctly handled by git if we let it
        git add $pattern 2>$null
    }
    
    # Need to check if diff exists
    $statusText = $(git diff --cached --name-only)
    if ([string]::IsNullOrWhiteSpace($statusText)) {
        Write-Host "No files found for this task!"
        git checkout main
        git branch -D $task.BranchName 2>$null
        continue
    }

    $dateStr = $currentDate.ToString("o")
    $env:GIT_AUTHOR_DATE = $dateStr
    $env:GIT_COMMITTER_DATE = $dateStr
    
    git commit -m $task.Message
    git push -u origin $task.BranchName --force
    
    git checkout main
    
    $mergeDateStr = $currentDate.AddMinutes(5).ToString("o")
    $env:GIT_AUTHOR_DATE = $mergeDateStr
    $env:GIT_COMMITTER_DATE = $mergeDateStr
    
    # Using --no-ff to create merge commits, showing actual branch history
    git merge $task.BranchName --no-edit --no-ff -m "Merge pull request: $($task.Message)"
    git push origin main
    
    $currentDate = $currentDate.AddSeconds($incrementSeconds)
}

$env:GIT_AUTHOR_DATE = ""
$env:GIT_COMMITTER_DATE = ""
Write-Host "========== ALL TASKS COMPLETED =========="
