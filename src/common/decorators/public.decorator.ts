import { IS_PUBLIC_KEY } from "@constants/decorators.constants";
import { SetMetadata } from "@nestjs/common";

const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export default Public;
