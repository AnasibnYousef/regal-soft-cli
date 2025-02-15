#!/usr/bin/env node
import { input } from "@inquirer/prompts";
import gradient from "gradient-string";
import figlet from "figlet";
import { createSpinner } from "nanospinner";
import { promises as fs } from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
import chalk from "chalk";
// Constants
const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ACCOUNTS_DOMAIN = "https://accounts.dev.regal-soft.in/";
const DEFAULT_API_URL = "https://dev.regal-soft.in/api";
// Performance tracking
const startTime = Date.now();
const taskTimings = {};
const REQUIRED_DIRECTORIES = [
    "src/assets",
    "src/components",
    "src/hooks",
    "src/lib",
    "src/pages",
    "src/services",
    "src/types",
    "src/components/ui",
];
// Grouped dependencies for better installation management
const DEPENDENCY_GROUPS = {
    ui: [
        "@radix-ui/react-slot",
        "@radix-ui/react-separator",
        "@radix-ui/react-tooltip",
        "@radix-ui/react-dialog",
        "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-accordion",
        "@radix-ui/react-avatar",
        "@radix-ui/react-collapsible",
        "@radix-ui/react-label",
        "@radix-ui/react-popover",
        "@radix-ui/react-select",
        "lucide-react",
    ],
    core: [
        "nuqs",
        "sonner",
        "next-themes",
        "tailwind-merge",
        "tailwindcss-animate",
        "class-variance-authority",
        "clsx",
    ],
    stateAndRouting: [
        "@tanstack/react-query",
        "@tanstack/react-query-devtools",
        "zustand",
        "react-router-dom",
    ],
    utils: [
        "date-fns",
        "date-fns-tz",
        "react-day-picker",
        "cmdk",
        "axios",
        "zod",
    ],
};
const DEV_DEPENDENCIES = [
    "tailwindcss@3",
    "postcss",
    "autoprefixer",
    "@types/node",
];
// Enhanced utility functions
const createTaskTimer = (taskName) => {
    let startTime = 0;
    return {
        start: () => { startTime = Date.now(); },
        end: () => {
            const duration = Date.now() - startTime;
            taskTimings[taskName] = duration;
            return duration;
        }
    };
};
const createTaskSpinner = (message) => {
    return createSpinner(message, {
        color: 'blue',
        frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
        interval: 80
    });
};
const logTaskCompletion = (taskName, duration) => {
    console.log(chalk.gray(`├─ ${taskName}: ${(duration / 1000).toFixed(2)}s`));
};
// Enhanced validation functions with detailed feedback
const validateFolderName = async (input) => {
    if (input === ".")
        return true;
    if (!input)
        return "Folder name cannot be empty";
    if (!/^[a-z0-9-_]+$/.test(input)) {
        return "Folder name must contain only lowercase letters, numbers, dashes, or underscores";
    }
    if (input.length > 214) {
        return "Folder name is too long (max 214 characters)";
    }
    try {
        await fs.access(input);
        return `Folder "${input}" already exists. Please choose a different name.`;
    }
    catch {
        return true;
    }
};
const validateModuleName = (input) => {
    if (!input)
        return "Module name cannot be empty";
    if (!/^[A-Z]/.test(input))
        return "Module name must start with a capital letter";
    if (!/^[A-Za-z0-9]+$/.test(input)) {
        return "Module name must contain only letters and numbers";
    }
    return true;
};
const validateIconName = (input) => {
    if (!input)
        return "Icon name cannot be empty";
    return true;
};
async function createProjectDirectory(projectPath) {
    const timer = createTaskTimer("Directory Creation");
    const spinner = createTaskSpinner("Creating project directory...");
    timer.start();
    try {
        if (projectPath !== process.cwd()) {
            await fs.mkdir(projectPath, { recursive: true });
        }
        const duration = timer.end();
        spinner.success({ text: chalk.green(`✓ Project directory created (${(duration / 1000).toFixed(2)}s)`) });
    }
    catch (error) {
        spinner.error({ text: chalk.red(`Failed to create project directory: ${error.message}`) });
        throw error;
    }
}
async function initializeGit(projectPath) {
    const timer = createTaskTimer("Git Initialization");
    const spinner = createTaskSpinner("Initializing Git repository...");
    timer.start();
    try {
        execSync("git init", { cwd: projectPath, stdio: 'pipe' });
        const duration = timer.end();
        spinner.success({ text: chalk.green(`✓ Git repository initialized (${(duration / 1000).toFixed(2)}s)`) });
    }
    catch (error) {
        spinner.error({ text: chalk.red("Failed to initialize Git repository") });
        throw error;
    }
}
async function createViteApp(projectPath) {
    const timer = createTaskTimer("Vite Setup");
    const spinner = createTaskSpinner("Creating Vite application...");
    timer.start();
    try {
        execSync(`npm create vite@latest . -- --template react-ts`, {
            cwd: projectPath,
            stdio: 'pipe'
        });
        const duration = timer.end();
        spinner.success({ text: chalk.green(`✓ Vite application created (${(duration / 1000).toFixed(2)}s)`) });
    }
    catch (error) {
        spinner.error({ text: chalk.red("Failed to create Vite application") });
        throw error;
    }
}
async function createDirectoryStructure(projectPath) {
    const timer = createTaskTimer("Directory Structure");
    const spinner = createTaskSpinner("Setting up project structure...");
    timer.start();
    try {
        await Promise.all(REQUIRED_DIRECTORIES.map(dir => fs.mkdir(path.join(projectPath, dir), { recursive: true })));
        const duration = timer.end();
        spinner.success({ text: chalk.green(`✓ Project structure created (${(duration / 1000).toFixed(2)}s)`) });
    }
    catch (error) {
        spinner.error({ text: chalk.red("Failed to create directory structure") });
        throw error;
    }
}
async function createEnvFile(projectPath, config) {
    const timer = createTaskTimer("Environment Setup");
    const spinner = createTaskSpinner("Creating environment configuration...");
    timer.start();
    try {
        const envContent = `VITE_PUBLIC_ACCOUNTS_DOMAIN=${config.accountsDomain}
VITE_PUBLIC_API_URL=${config.apiUrl}`;
        await fs.writeFile(path.join(projectPath, ".env"), envContent);
        const duration = timer.end();
        spinner.success({ text: chalk.green(`✓ Environment file created (${(duration / 1000).toFixed(2)}s)`) });
    }
    catch (error) {
        spinner.error({ text: chalk.red("Failed to create environment file") });
        throw error;
    }
}
async function installDependencyGroup(projectPath, groupName, dependencies, isDev = false) {
    const timer = createTaskTimer(`Installing ${groupName}`);
    const spinner = createTaskSpinner(`Installing ${groupName} dependencies...`);
    timer.start();
    try {
        const command = `npm install ${isDev ? '-D' : ''} ${dependencies.join(" ")}`;
        execSync(command, { cwd: projectPath, stdio: 'pipe' });
        const duration = timer.end();
        spinner.success({
            text: chalk.green(`✓ ${groupName} dependencies installed (${(duration / 1000).toFixed(2)}s)`)
        });
    }
    catch (error) {
        spinner.error({ text: chalk.red(`Failed to install ${groupName} dependencies`) });
        throw error;
    }
}
async function installDependencies(projectPath) {
    console.log(chalk.blue.bold("\nInstalling dependencies..."));
    for (const [groupName, deps] of Object.entries(DEPENDENCY_GROUPS)) {
        await installDependencyGroup(projectPath, groupName, deps);
    }
    await installDependencyGroup(projectPath, "dev dependencies", DEV_DEPENDENCIES, true);
    // Configure Tailwind
    const tailwindTimer = createTaskTimer("Tailwind Configuration");
    const tailwindSpinner = createTaskSpinner("Configuring Tailwind...");
    tailwindTimer.start();
    try {
        execSync(`npx tailwindcss init -p`, { cwd: projectPath, stdio: 'pipe' });
        const duration = tailwindTimer.end();
        tailwindSpinner.success({
            text: chalk.green(`✓ Tailwind configured (${(duration / 1000).toFixed(2)}s)`)
        });
    }
    catch (error) {
        tailwindSpinner.error({ text: chalk.red("Failed to configure Tailwind") });
        throw error;
    }
}
async function copyTemplates(projectPath, config) {
    const timer = createTaskTimer("Template Setup");
    const spinner = createTaskSpinner("Copying project templates...");
    timer.start();
    const templatePath = path.join(CURRENT_DIR, "templates");
    try {
        await fs.access(templatePath);
    }
    catch {
        const duration = timer.end();
        spinner.warn({
            text: chalk.yellow(`⚠ No templates found, skipping... (${(duration / 1000).toFixed(2)}s)`)
        });
        return;
    }
    try {
        const replaceInFile = async (filePath) => {
            let content = await fs.readFile(filePath, "utf8");
            content = content.replace(/\${moduleName}/g, config.moduleName);
            content = content.replace(/\${iconName}/g, config.iconName);
            await fs.writeFile(filePath, content);
        };
        async function copyDir(source, dest) {
            const entries = await fs.readdir(source, { withFileTypes: true });
            await Promise.all(entries.map(async (entry) => {
                const srcPath = path.join(source, entry.name);
                const destPath = path.join(dest, entry.name);
                if (entry.isDirectory()) {
                    await fs.mkdir(destPath, { recursive: true });
                    await copyDir(srcPath, destPath);
                }
                else {
                    await fs.copyFile(srcPath, destPath);
                    await replaceInFile(destPath);
                }
            }));
        }
        await copyDir(templatePath, projectPath);
        const duration = timer.end();
        spinner.success({
            text: chalk.green(`✓ Templates copied successfully (${(duration / 1000).toFixed(2)}s)`)
        });
    }
    catch (error) {
        spinner.error({ text: chalk.red("Failed to copy templates") });
        throw error;
    }
}
async function configureShadcn(projectPath) {
    const timer = createTaskTimer("Shadcn Setup");
    const spinner = createTaskSpinner("Configuring shadcn/ui components...");
    timer.start();
    try {
        execSync("npx shadcn@latest init", { cwd: projectPath, stdio: 'pipe' });
        const duration = timer.end();
        spinner.success({
            text: chalk.green(`✓ shadcn/ui configured successfully (${(duration / 1000).toFixed(2)}s)`)
        });
    }
    catch (error) {
        spinner.error({ text: chalk.red("Failed to configure shadcn components") });
        throw error;
    }
}
async function getProjectConfig() {
    console.clear();
    console.log('\n');
    console.log(gradient.pastel.multiline(figlet.textSync("Regal-Soft", {
        font: 'Standard',
        horizontalLayout: 'full'
    })));
    console.log('\n');
    console.log(chalk.blue.bold("🚀 Welcome to Regal-Soft Module Creator!\n"));
    console.log(chalk.gray("System Information:"));
    console.log(chalk.gray(`├─ Node.js: ${process.version}`));
    console.log(chalk.gray(`├─ Platform: ${process.platform}`));
    console.log(chalk.gray(`└─ Architecture: ${process.arch}\n`));
    return {
        folderName: await input({
            message: chalk.cyan("Please provide the folder name (or '.' for current directory): "),
            validate: validateFolderName,
        }),
        moduleName: await input({
            message: chalk.cyan("Please provide the Module name: "),
            validate: validateModuleName,
        }),
        iconName: await input({
            message: chalk.cyan("Please provide the Icon name: "),
            validate: validateIconName,
        }),
        accountsDomain: await input({
            message: chalk.cyan("Enter VITE_PUBLIC_ACCOUNTS_DOMAIN: "),
            default: DEFAULT_ACCOUNTS_DOMAIN,
        }),
        apiUrl: await input({
            message: chalk.cyan("Enter VITE_PUBLIC_API_URL: "),
            default: DEFAULT_API_URL,
        })
    };
}
async function main() {
    try {
        const config = await getProjectConfig();
        const projectPath = config.folderName === "." ? process.cwd() : path.join(process.cwd(), config.folderName);
        console.log(chalk.blue.bold("\n🛠  Starting project creation...\n"));
        // Execute tasks with timing
        await createProjectDirectory(projectPath);
        await initializeGit(projectPath);
        await createViteApp(projectPath);
        await createDirectoryStructure(projectPath);
        await createEnvFile(projectPath, config);
        await installDependencies(projectPath);
        await copyTemplates(projectPath, config);
        await configureShadcn(projectPath);
        const totalDuration = (Date.now() - startTime) / 1000;
        console.log('\n');
        console.log(chalk.green.bold(`🎉 Project created successfully! (${totalDuration.toFixed(2)}s)\n`));
        // Display timing summary
        console.log(chalk.blue("Task Timings:"));
        Object.entries(taskTimings).forEach(([task, duration]) => {
            console.log(chalk.gray(`├─ ${task}: ${(duration / 1000).toFixed(2)}s`));
        });
        // Display memory usage
        const memoryUsage = process.memoryUsage();
        console.log(chalk.blue("\nMemory Usage:"));
        console.log(chalk.gray(`├─ Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`));
        console.log(chalk.gray(`├─ Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`));
        console.log(chalk.gray(`└─ RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`));
        // Project information
        console.log(chalk.blue("\nProject Information:"));
        console.log(chalk.gray(`├─ Project Path: ${projectPath}`));
        console.log(chalk.gray(`├─ Module Name: ${config.moduleName}`));
        console.log(chalk.gray(`└─ Environment: ${config.accountsDomain}`));
        // Next steps
        console.log('\n' + chalk.blue("Next steps:"));
        console.log(chalk.white(`  1. cd ${chalk.cyan(config.folderName)}`));
        console.log(chalk.white("  2. npm run dev"));
        // Additional information
        console.log(chalk.blue("Additional Information:"));
        console.log(chalk.gray("├─ Project includes:"));
        console.log(chalk.gray("│  ├─ TypeScript configuration"));
        console.log(chalk.gray("│  ├─ Vite setup"));
        console.log(chalk.gray("│  ├─ Tailwind CSS"));
        console.log(chalk.gray("│  ├─ shadcn/ui components"));
        console.log(chalk.gray("│  └─ Project structure"));
        console.log(chalk.gray("└─ Documentation can be found in the project's README.md\n"));
        console.log(chalk.gray("Happy coding! 🚀\n"));
    }
    catch (error) {
        console.log('\n');
        console.error(chalk.red.bold("❌ Project creation failed:"));
        console.error(chalk.red(error.message));
        // Additional error information
        if (error instanceof Error) {
            if (error.stack) {
                console.log(chalk.gray("\nError Stack:"));
                console.log(chalk.gray(error.stack));
            }
            console.log(chalk.yellow("\nTroubleshooting steps:"));
            console.log(chalk.gray("1. Ensure you have Node.js 14 or higher installed"));
            console.log(chalk.gray("2. Check your internet connection"));
            console.log(chalk.gray("3. Make sure you have write permissions in the target directory"));
            console.log(chalk.gray("4. Try clearing npm cache: npm cache clean --force"));
            console.log(chalk.gray("5. Check if the specified folder name is valid"));
        }
        process.exit(1);
    }
}
main();
