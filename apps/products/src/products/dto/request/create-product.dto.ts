import { OmitType } from "@nestjs/mapped-types";
import { ProductDto } from "@core/core";


export class CreateProductDto extends OmitType(ProductDto, ['id']) {}
