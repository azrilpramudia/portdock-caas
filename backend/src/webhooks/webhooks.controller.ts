import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('github')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle GitHub push webhooks' })
  async handleGithub(
    @Headers('x-hub-signature-256') signature: string,
    @Body() payload: any,
  ) {
    return this.webhooksService.handleGithubWebhook(signature, payload);
  }
}
