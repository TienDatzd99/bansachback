import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { BookReviewService } from './book-review.service';
import { CreateOrUpdateBookReviewDto } from './dto/create-or-update-book-review.dto';

@ApiTags('Books')
@Controller('books')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly bookReviewService: BookReviewService,
  ) {}

  @Post('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROLE_ADMIN')
  @UsePipes(ValidationPipe)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a book for current account (admin)' })
  @ApiBody({ type: CreateBookDto })
  createForSeller(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() createBookDto: CreateBookDto,
  ) {
    return this.bookService.createForSeller(currentUser.sub, createBookDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROLE_ADMIN')
  @UsePipes(ValidationPipe)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create book' })
  @ApiBody({ type: CreateBookDto })
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all books' })
  findAll() {
    return this.bookService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROLE_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get books of current account (admin)' })
  findMyBooks(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.bookService.findMyBooks(currentUser.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get book by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.findOne(id);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get all reviews of a book' })
  getBookReviews(@Param('id', ParseIntPipe) id: number) {
    return this.bookReviewService.getReviewsByBook(id);
  }

  @Get(':id/review-summary')
  @ApiOperation({ summary: 'Get rating summary of a book' })
  getBookReviewSummary(@Param('id', ParseIntPipe) id: number) {
    return this.bookReviewService.getReviewSummary(id);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update review for a purchased book' })
  @ApiBody({ type: CreateOrUpdateBookReviewDto })
  createOrUpdateBookReview(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateOrUpdateBookReviewDto,
  ) {
    return this.bookReviewService.createOrUpdateReview(
      currentUser.sub,
      id,
      dto,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROLE_ADMIN')
  @UsePipes(ValidationPipe)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update book by id' })
  @ApiBody({ type: UpdateBookDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.bookService.update(id, updateBookDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROLE_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete book by id' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.remove(id);
  }
}
