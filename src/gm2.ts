import fs from "fs";
import path from "path";

// --- Type Definitions for Configuration ---

type FieldType = 'string' | 'number' | 'boolean' | 'objectId' | 'date';

interface FieldDefinition {
  type: FieldType;
  required: boolean;
  requiredMessage?: string;
  unique?: boolean;
  ref?: string; // Target model for objectId reference
}

interface ModelConfig {
  moduleName: string;
  profileName: string;
  fields: Record<string, FieldDefinition>;
}

// --- Utility Functions ---

/** Converts string to PascalCase (e.g., product_category -> ProductCategory) */
function capitalize(str: string): string {
  if (!str) return "";
  const parts = str.split(/[^a-zA-Z0-9]/);
  return parts.map(part => part.charAt(0)?.toUpperCase() + part.slice(1)).join('');
}

/** Maps a simple string type to a TypeScript interface type */
function mapToTsType(type: FieldType): string {
  switch (type.toLowerCase()) {
    case 'string':
    case 'date':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'objectid':
      return 'Types.ObjectId';
    default:
      return 'any';
  }
}

/** Maps a simple string type to a Mongoose Schema type */
function mapToMongooseType(type: FieldType): string {
  switch (type.toLowerCase()) {
    case 'string':
      return 'String';
    case 'number':
      return 'Number';
    case 'boolean':
      return 'Boolean';
    case 'date':
      return 'Date';
    case 'objectid':
      return 'Schema.Types.ObjectId';
    default:
      return 'String';
  }
}

// --- Dynamic Content Generators ---

function generateTsInterface(PascalModuleName: string, fields: Record<string, FieldDefinition>): string {
  const interfaceFields = Object.keys(fields)
    .map(fieldName => {
      const field = fields[fieldName];
      const tsType = mapToTsType(field.type);
      const isOptional = !field.required;
      // Note: ObjectIds are not optional if they have a ref
      return `    ${fieldName}${isOptional ? '?' : ''}: ${tsType};`;
    })
    .join('\n');

  return `
import { Document, Types } from "mongoose";

export interface I${PascalModuleName} extends Document {
${interfaceFields}
}
`;
}

function generateMongooseSchema(moduleName: string, PascalModuleName: string, fields: Record<string, FieldDefinition>): string {
  const schemaFields = Object.keys(fields)
    .map(fieldName => {
      const field = fields[fieldName];
      const mongooseType = mapToMongooseType(field.type);
      
      // Use double quotes for the requiredMessage for better stability in generated code.
      const messageContent = field.requiredMessage || `${fieldName} is required`;
      const requiredMessage = `"${messageContent}"`; // Wrap the message in double quotes

      let schemaOptions = `{
    type: ${mongooseType},
    required: [${field.required}, ${requiredMessage}],`;

      if (field.unique) {
        schemaOptions += `\n    unique: true,`;
      }
      if (field.type.toLowerCase() === 'objectid' && field.ref) {
        schemaOptions += `\n    ref: '${field.ref}',`;
      }

      schemaOptions += `\n  }`;

      return `  ${fieldName}: ${schemaOptions},`;
    })
    .join('\n');

  return `
import { model, Schema } from "mongoose";
import { I${PascalModuleName} } from "./${moduleName}_types";

const ${moduleName}_schema = new Schema<I${PascalModuleName}>({
${schemaFields}
}, { timestamps: true });

export const ${moduleName}_model = model<I${PascalModuleName}>("${PascalModuleName}", ${moduleName}_schema);
`;
}

function generateZodSchema(fields: Record<string, FieldDefinition>): string {
  const zodFields = Object.keys(fields)
    .map(fieldName => {
      const field = fields[fieldName];
      let zodChain = '';
      
      // FIX: Ensure the required message is always wrapped in double quotes for Zod validation
      const requiredMsg = field.requiredMessage ? `"${field.requiredMessage}"` : `"${fieldName} is required"`;

      switch (field.type.toLowerCase()) {
        case 'string':
        case 'date':
        case 'objectId': // Validate ObjectId as a string in Zod
          zodChain = `z.string()`;
          break;
        case 'number':
          zodChain = `z.number()`;
          break;
        case 'boolean':
          zodChain = `z.boolean()`;
          break;
        default:
          zodChain = `z.any()`;
      }

      // Add required check
      if (field.required) {
        if (field.type.toLowerCase() === 'string') {
           zodChain += `.min(1, { message: ${requiredMsg} })`;
        }
      } else {
        zodChain += `.optional()`;
      }

      return `    ${fieldName}: ${zodChain},`;
    })
    .join('\n');

  return `
import { z } from "zod";
  
const create_validation = z.object({
  body: z.object({
${zodFields}
  }),
});

const update_validation = z.object({
  body: z.object({
${zodFields.replace(/z\.string\(\)\.min\([0-9]+, { message: (.*) }\)/g, 'z.string().optional()').replace(/\.optional\(\)/g, '')}
  }).partial(), // Allows updating only a subset of fields
});

export const validation = Object.freeze({
  create_validation,
  update_validation
})
`;
}


// --- Template Content (Using functions for cleanliness) ---

const getControllerTemplate = (moduleName: string) => `
import { SearchKeys } from './../../utils/Queries';
import { Request, Response } from "express";
import { ${moduleName}_service } from "./${moduleName}_service";
import { sendResponse } from "../../utils/sendResponse";
import { HttpStatus } from "../../DefaultConfig/config";
import { IAuth } from '../Auth/auth_types';

const create = async(req: Request, res: Response)=> {
    // Handling optional image upload. Modify this logic if needed.
    const img = !Array.isArray(req.files) && req.files?.img && req.files.img.length > 0 && req.files.img[0]?.path || null;
    if (img) req.body.img = img

    const result = await ${moduleName}_service.create(req?.body)
    sendResponse(
        res,
        HttpStatus.CREATED,
        result
    )
}

const get_all=async(req: Request, res: Response)=> {
    const { search, ...otherValues } = req?.query;
    const searchKeys: SearchKeys = {}

    // Example search: assuming a 'name' field
    if (search) searchKeys.name = search as string

    const queryKeys = { ...otherValues }

    const result = await ${moduleName}_service.get_all(queryKeys, searchKeys)
    sendResponse(
        res,
        HttpStatus.SUCCESS,
        result
    )
}

const update =async(req: Request, res: Response)=> {
    // Handling optional image upload. Modify this logic if needed.
    const img = !Array.isArray(req.files) && req.files?.img && req.files.img.length > 0 && req.files.img[0]?.path || null;
    if (img) req.body.img = img

    const result = await ${moduleName}_service.update(req?.params?.id, req?.body)
    sendResponse(
        res,
        HttpStatus.SUCCESS,
        result
    )
}

const delete_${moduleName} = async(req: Request, res: Response)=> {
    const result = await ${moduleName}_service.delete_${moduleName}(req?.params?.id, req?.body, req?.user as IAuth)
    sendResponse(
        res,
        HttpStatus.SUCCESS,
        result
    )
}

export const ${moduleName}_controller = Object.freeze({
    create,
    get_all,
    update,
    delete_${moduleName}
})
`;

const getServiceTemplate = (moduleName: string) => `
import mongoose from 'mongoose';
import { QueryKeys, SearchKeys } from "../../utils/Queries";
import { ${moduleName}_model } from "./${moduleName}_model";
import { IAuth } from '../Auth/auth_types';
import bcrypt from 'bcrypt'
import Aggregator from '../../utils/Aggregator';

// NOTE: Placeholder for any related models for cascade deletion
// import { service_model } from '../Service/service_model'; 

const create =async(data: { [key: string]: any })=> {
    const result = await ${moduleName}_model.create(data)
    return {
        success: true,
        message: '${moduleName} created successfully',
        data: result
    }
}

const get_all = async(queryKeys: QueryKeys, searchKeys: SearchKeys)=> {
    // Aggregator utility is used for complex querying/pagination
    return await Aggregator(${moduleName}_model, queryKeys, searchKeys, [])
}

const update=async(id: string, data: { [key: string]: any }) =>{
    const result = await ${moduleName}_model.findByIdAndUpdate(id, {
        $set: { ...data }
    }, { new: true })

    if (!result) throw new Error('${moduleName} not found or update failed')

    return {
        success: true,
        message: '${moduleName} updated successfully',
        data: result
    }
}

const delete_${moduleName}=async(id: string, data: { [key: string]: any }, auth: IAuth)=> {
    
    // Example secure deletion logic requiring name confirmation and password check
    const is_exists = await ${moduleName}_model.findOne({ _id: id, name: data?.name })
    if (!is_exists) throw new new Error("${moduleName} not found")

    // Assuming Auth model has a password field and bcrypt is available
    const is_pass_mass = await bcrypt.compare(data?.password, auth?.password)
    if (!is_pass_mass) throw new Error("password doesn't match")

    const session = await mongoose.startSession();
    try {
        const result = await session.withTransaction(async () => {
            const [result] = await Promise.all([
                ${moduleName}_model.findByIdAndDelete(id, { session }),
                // service_model.deleteMany({ ${moduleName}: id }, { session }), // Example cascade
            ])
            return result
        })
        return {
            success: true,
            message: '${moduleName} deleted successfully',
            data: result
        }
    } catch (error) {
        throw error;
    } finally {
        await session.endSession();
    }
}

export const ${moduleName}_service = Object.freeze({
    create,
    get_all,
    update,
    delete_${moduleName}
}) 
`;

const getRouteTemplate = (moduleName: string) => `
import express from 'express'
import asyncWrapper from '../../middleware/asyncWrapper';
import { ${moduleName}_controller } from './${moduleName}_controller';
import verifyToken from '../../middleware/verifyToken';
import config from '../../DefaultConfig/config';
import uploadFile from '../../middleware/fileUploader';
// import { validation } from './${moduleName}_validate'; // Import if using validation middleware
// import validate from '../../middleware/validate'; // Import validate middleware

export const ${moduleName}_router = express.Router()

${moduleName}_router
    .post('/${moduleName}/create', 
        verifyToken(config.ADMIN), 
        uploadFile(), 
        // validate(validation.create_validation), // Uncomment to use validation
        asyncWrapper(${moduleName}_controller.create)
    )

    .get('/${moduleName}/get-all', asyncWrapper(${moduleName}_controller.get_all))

    .patch('/${moduleName}/update/:id', 
        verifyToken(config.ADMIN), 
        uploadFile(), 
        // validate(validation.update_validation), // Uncomment to use validation
        asyncWrapper(${moduleName}_controller.update)
    )

    .delete('/${moduleName}/delete/:id', verifyToken(config.ADMIN), asyncWrapper(${moduleName}_controller.delete_${moduleName}))
`;


// --- Main Generator Function ---

function createModule(config: ModelConfig): void {
  const { profileName, moduleName, fields } = config;
  const PascalModuleName = capitalize(moduleName);
  const baseDir = path.join(__dirname, profileName);

  // 1. Setup Directories
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir);
  }
  const moduleDir = path.join(baseDir, moduleName);
  if (!fs.existsSync(moduleDir)) {
    fs.mkdirSync(moduleDir);
  }

  // 2. Define all file contents
  const allContents: Record<string, string> = {
    [`${moduleName}_types.ts`]: generateTsInterface(PascalModuleName, fields),
    [`${moduleName}_model.ts`]: generateMongooseSchema(moduleName, PascalModuleName, fields),
    [`${moduleName}_validate.ts`]: generateZodSchema(fields),
    [`${moduleName}_controller.ts`]: getControllerTemplate(moduleName),
    [`${moduleName}_service.ts`]: getServiceTemplate(moduleName),
    [`${moduleName}_route.ts`]: getRouteTemplate(moduleName),
  };

  // 3. Write Files
  const createdFiles: string[] = [];
  Object.keys(allContents).forEach((file) => {
    const filePath = path.join(moduleDir, file);
    if (!fs.existsSync(filePath)) {
      const content = allContents[file]?.trim() || '';
      fs.writeFileSync(filePath, content, "utf8");
      createdFiles.push(file);
    }
  });

  console.log(`\n✅ Module '${moduleName}' created successfully inside '${profileName}'.`);
  console.log(`\nCreated ${createdFiles.length} files:\n- ${createdFiles.join('\n- ')}`);
}

// --- SCRIPT EXECUTION BLOCK (MODIFIED FOR GM2.TS) ---

// 1. Define the hardcoded path to the configuration file
const CONFIG_FILE_NAME = 'gm_model2.json';
const configFilePath: string = path.resolve(__dirname, CONFIG_FILE_NAME);

if (!fs.existsSync(configFilePath)) {
    console.error(`Error: Configuration file not found at ${configFilePath}.`);
    console.error(`Please ensure a file named '${CONFIG_FILE_NAME}' exists next to 'gm2.ts' and contains your module definitions.`);
    process.exit(1);
}

let config: ModelConfig;

try {
  const fileContent = fs.readFileSync(configFilePath, 'utf8');
  config = JSON.parse(fileContent) as ModelConfig;

  if (!config.moduleName || !config.profileName || !config.fields) {
      throw new Error("Config must contain 'moduleName', 'profileName', and 'fields'.");
  }

} catch (error) {
  console.error("Error loading or parsing configuration file:", error instanceof Error ? error.message : "Invalid JSON format");
  process.exit(1);
}

// 2. Run the module creation
createModule(config);