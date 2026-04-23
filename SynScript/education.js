document.addEventListener('DOMContentLoaded', function () {
            
            const navLinks = document.querySelectorAll('.education-nav a');
            const sections = document.querySelectorAll('.education-section');

            function activateSection(sectionId) {
                navLinks.forEach(l => l.classList.remove('nav-link-active'));
                sections.forEach(s => s.classList.remove('active'));

                const activeLink = document.querySelector(`.education-nav a[data-section="${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('nav-link-active');
                }

                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    targetSection.classList.add('active');
                    window.scrollTo({
                        top: document.querySelector('.education-header').offsetTop - 20,
                        behavior: 'smooth'
                    });
                }
            }

            navLinks.forEach(link => {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    const sectionId = this.getAttribute('data-section');
                    activateSection(sectionId);
                    history.pushState(null, null, `#${sectionId}`);
                });
            });

            if (window.location.hash) {
                const hash = window.location.hash.substring(1);
                const validSections = ['regenerative', 'syntropics', 'agroforestry', 'climate'];
                if (validSections.includes(hash)) {
                    activateSection(hash);
                }
            } else {
                activateSection('regenerative');
            }

            
            const imageMap = {
                // syntropic images
                'soil-regeneration-img': 'Photos/soilregeneration.jpg',
                'water-conservation-img': 'Photos/waterretention.jpeg',
                'carbon-sequestration-img': 'Photos/cotwo.jpg',
                'economic-resilience-img': 'Photos/diversifiedincome.jpg',
                
                // regenerative agriculture images
                'minimize-disturbance-img': 'Photos/notill.webp',
                'armor-soil-img': 'Photos/healthysoil.jpg',
                'increase-diversity-img': 'Photos/diversityimg.jpg',
                'living-roots-img': 'Photos/soillayers.jpg',
                'integrate-animals-img': 'Photos/intergratelivestock.webp',
                
                // agroforestry images
                'alley-cropping-img': 'Photos/alleycropping.jpg',
                'silvopasture-img': 'Photos/silvopastureone.jpg',
                'forest-farming-img': 'Photos/foodforest.jpg',
                'windbreaks-img': 'Photos/windbreaks.jpg',
                'riparian-buffer-img': 'Photos/riparianbuffer.jpg',
                'home-gardens-img': 'Photos/homesyntropics.jpg',
                
                // climate action images
                'start-small-img': 'Photos/startsmall.jpg',
                'measure-progress-img': 'Photos/trackdata.jpg',
                'join-networks-img': 'Photos/getconnected.jpg',
                'explore-markets-img': 'Photos/montpeliermarket.jpg'
            };

            
            for (const [id, path] of Object.entries(imageMap)) {
                const element = document.getElementById(id);
                if (element) {
                    const img = new Image();
                    img.onload = function() {
                        element.style.backgroundImage = `url('${path}')`;
                    };
                    img.onerror = function() {
                        element.style.background = `linear-gradient(135deg, #3a5d3f, #5a8c5a)`;
                    };
                    img.src = path;
                }
            }
        });