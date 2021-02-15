import smileyLove from '../svgs/smiley-love.svg';

console.log(smileyLove);
document
	.querySelector('.page')
	.insertAdjacentHTML(
		'beforeend',
		`<svg class="icon icon-${smileyLove.name}"><use href="#${smileyLove.name}"></use>`
	);
