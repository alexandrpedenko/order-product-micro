import { CategoryDto } from "@core/core";
import { OmitType } from "@nestjs/mapped-types";

export class CreateCategoryDto extends OmitType(CategoryDto, ['id']) {}
