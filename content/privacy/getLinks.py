import os

# get all pdf names
def get_pdf_names(directory):
	pdf_names = []
	for filename in os.listdir(directory):
		if filename.endswith('.pdf'):
			pdf_names.append(filename)
	return pdf_names
def make_links(pdf_names, base_url):
	links = []
	for name in pdf_names:
		link = f"{base_url}/{name}"
		links.append(link)
	return links
def main():
	directory = 'content/privacy'
	base_url = 'https://gmg-dev.com/'+directory
	pdf_names = get_pdf_names(directory)
	links = make_links(pdf_names, base_url)
	with open('content/privacy/links.txt', 'a') as f:
		for link in links:
			f.write(link + '\n')

if __name__ == "__main__":
	main()