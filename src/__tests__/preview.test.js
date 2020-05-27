'use strict';

import preview from '../preview';

let previewSprite;
beforeEach(() => {
	previewSprite = preview([
		{
			name: 'app-a',
			content:
				'<svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;"><defs><linearGradient id="a"><stop offset="5%" stop-color="green"/><stop offset="95%" stop-color="gold"/></linearGradient></defs><symbol id="gradient"><rect fill="url(#a)" width="100%" height="100%"/></symbol><symbol id="video" viewBox="0 0 16 16"><path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.3 8.5l-4.5 3c-.1 0-.1.1-.2.1s-.2 0-.3-.1c-.2-.1-.3-.3-.3-.5V5c0-.2.1-.4.2-.5.2-.1.3-.1.5 0l4.5 3c.2.1.3.3.3.5s-.1.4-.2.5z" fill="#ff004b"/></symbol><symbol id="smiley-love" viewBox="0 0 48 48"><circle class="st0" cx="24" cy="24" r="24" fill="#fbd971"/><path class="st1" d="M24 41.1c-7.6 0-13.7-6.2-13.7-13.7 0-.6.5-1.1 1.1-1.1.6 0 1.1.5 1.1 1.1 0 6.3 5.1 11.4 11.4 11.4s11.4-5.1 11.4-11.4c0-.6.5-1.1 1.1-1.1.6 0 1.1.5 1.1 1.1.2 7.6-5.9 13.7-13.5 13.7z" fill="#d8b11a"/><path d="M14.3 12.2c.5-1.1 1.6-1.9 3-1.9 1.8 0 3.1 1.5 3.2 3.2 0 0 .1.4-.1 1.2-.3 1.1-.9 2-1.7 2.8l-4.4 3.8-4.3-3.8c-.8-.7-1.4-1.7-1.7-2.8-.2-.8-.1-1.2-.1-1.2.2-1.8 1.5-3.2 3.2-3.2 1.4 0 2.4.8 2.9 1.9z" fill="#e64c3c"/><path data-name="Calque 1-2-2" d="M33.6 12.2c.5-1.1 1.6-1.9 3-1.9 1.8 0 3.1 1.5 3.2 3.2 0 0 .1.4-.1 1.2-.3 1.1-.9 2-1.7 2.8l-4.4 3.8-4.3-3.8c-.8-.7-1.4-1.7-1.7-2.8-.2-.8-.1-1.2-.1-1.2.2-1.8 1.5-3.2 3.2-3.2 1.3 0 2.4.8 2.9 1.9z" fill="#e64c3c"/></symbol></svg>',
			svgs: ['gradient', 'video', 'smiley-love']
		}
	]);
});

describe('Preview', () => {
	it('Should call the templatePreview function', () => {
		expect(previewSprite).toEqual(expect.any(String));
	});
});
