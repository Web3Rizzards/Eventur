// Farcaster Frames
// https://docs.farcaster.xyz/reference/frames/spec

import { type TupleOf } from './tupleOf';
// Types
import type { FarcasterCastId, FarcasterUserId } from './types';

// Functions
import { isTruthy } from './isTruthy';
import { resolveUrl } from './resolveUrl';

import { text } from '@sveltejs/kit';

export type FrameSignaturePacket<HasInputText extends boolean = boolean> = {
  untrustedData: {
    fid: FarcasterUserId;
    url: string;
    messageHash: `0x${string}`;
    timestamp: number;
    network: number;
    buttonIndex: 1 | 2 | 3 | 4;
    inputText?: HasInputText extends true ? string : never;
    castId: {
      fid: FarcasterUserId;
      hash: FarcasterCastId;
    };
  };
  trustedData: {
    messageBytes: string;
  };
};

export type FrameButton = {
  label: string;
  action?: 'post' | 'post_redirect' | 'link' | 'mint' | 'tx';
  targetUrl?: string;
};

export type FrameMeta = {
  version?: `${number}-${number}-${number}` | 'vNext';
  image: {
    url: string;
    aspectRatio?: `${1 | 1.91}:${1}`;
  };
  postUrl?: string;
  textInput?: string;
  buttons?: TupleOf<FrameButton | undefined, 0 | 1 | 2 | 3 | 4>;
  state?: Record<string, string>;
};

export const mockFrameMeta: FrameMeta = {
  version: '1-0-0',
  image: {
    url: 'https://placehold.co/1910x1000',
    aspectRatio: '1.91:1',
  },
  postUrl: 'https://example.com/frame-action',
  textInput: 'Enter your response...',
  buttons: [
    {
      label: 'Button 1',
      action: 'post',
      targetUrl: 'https://example.com/button1',
    },
    {
      label: 'Button 2',
      action: 'link',
      targetUrl: 'https://example.com/button2',
    },
    {
      label: 'Button 3',
      action: 'mint',
      targetUrl: 'https://example.com/button3',
    },
  ],
  state: {
    key1: 'value1',
    key2: 'value2',
  },
};

export const serializeFrameMeta = (frameMeta: FrameMeta, baseUrl?: URL | string) =>
  [
    {
      property: 'of:accepts:farcaster',
      content: frameMeta.version ?? 'vNext',
    },
    {
      property: 'fc:frame',
      content: frameMeta.version ?? 'vNext',
    },
    {
      property: 'of:image',
      content: resolveUrl(frameMeta.image.url, baseUrl),
    },
    {
      property: 'fc:frame:image',
      content: resolveUrl(frameMeta.image.url, baseUrl),
    },
    frameMeta.image.aspectRatio && {
      property: 'of:image:aspect_ratio',
      content: frameMeta.image.aspectRatio,
    },
    frameMeta.image.aspectRatio && {
      property: 'fc:frame:image:aspect_ratio',
      content: frameMeta.image.aspectRatio,
    },
    frameMeta.textInput && {
      property: 'of:input:text',
      content: frameMeta.textInput,
    },
    frameMeta.textInput && {
      property: 'fc:frame:input:text',
      content: frameMeta.textInput,
    },
    ...(frameMeta.buttons?.flatMap((button, index) =>
      button
        ? [
            {
              property: `of:button:${index + 1}`,
              content: button.label,
            },
            {
              property: `fc:frame:button:${index + 1}`,
              content: button.label,
            },
            button.action && {
              property: `of:button:${index + 1}:action`,
              content: button.action,
            },
            button.action && {
              property: `fc:frame:button:${index + 1}:action`,
              content: button.action,
            },
            button.targetUrl && {
              property: `of:button:${index + 1}:target`,
              content: resolveUrl(button.targetUrl, baseUrl),
            },
            button.targetUrl && {
              property: `fc:frame:button:${index + 1}:target`,
              content: resolveUrl(button.targetUrl, baseUrl),
            },
          ]
        : [],
    ) ?? []),
    frameMeta.postUrl && {
      property: 'of:post_url',
      content: resolveUrl(frameMeta.postUrl, baseUrl),
    },
    frameMeta.postUrl && {
      property: 'fc:frame:post_url',
      content: resolveUrl(frameMeta.postUrl, baseUrl),
    },
    frameMeta.state && {
      property: 'of:state',
      content: JSON.stringify(frameMeta.state),
    },
    frameMeta.state && {
      property: 'fc:frame:state',
      content: JSON.stringify(frameMeta.state),
    },
  ].filter(isTruthy);

export const renderFrameMeta = (frameMeta: FrameMeta, baseUrl?: URL | string) =>
  `
		<!DOCTYPE html>
		<html>
			<head>
				${serializeFrameMeta(frameMeta, baseUrl)
          .map(
            ({ property, content }) =>
              `<meta property="${property.replace(/"/, '&quot;')}" content="${content.replace(/"/, '&quot;')}" />`,
          )
          .join('\n')}
			</head>
		</html>
	`.trim();

export const createFrameResponse = (frameMeta: FrameMeta, baseUrl?: URL | string) =>
  text(renderFrameMeta(frameMeta, baseUrl));
