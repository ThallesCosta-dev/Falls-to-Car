import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import carCivic from "@/assets/car-civic.png";
import carC3 from "@/assets/car-c3.png";
import carPolo from "@/assets/car-polo.png";
import carMobi from "@/assets/car-mobi.png";

const slides = [
  {
    image: carCivic,
    title: "Bem-vindo!",
    description: "Seja bem vindo a uma nova experiência de aluguel de automóveis.",
  },
  {
    image: carC3,
    title: "A qualquer hora, em qualquer lugar",
    description: "Temos automóveis a sua disposição por todo o Brasil.",
  },
  {
    image: carPolo,
    title: "Comece aqui sua Aventura",
    description: "Escolha o seu modelo e retire agora mesmo na Agência mais próxima.",
  },
  {
    image: carMobi,
    title: "Bem-vindo ao Falls-to-car",
    description: "Crie sua conta ou faça login a uma conta existente.",
    isLast: true,
  },
];

export default function ClientOnboarding() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleNext = () => {
    if (emblaApi && currentSlide < slides.length - 1) {
      emblaApi.scrollNext();
    }
  };

  const scrollTo = (index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  };

  const handleCreateAccount = () => {
    navigate("/client/auth?mode=signup");
  };

  const handleLogin = () => {
    navigate("/client/auth?mode=login");
  };

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="pt-6 pb-4 text-center">
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          Falls-to-Car
        </h1>
      </div>

      {/* Car Image Carousel */}
      <div className="flex-1 overflow-hidden flex items-center justify-center" ref={emblaRef}>
        <div className="flex w-full items-center">
          {slides.map((s, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 flex items-center justify-center px-8"
            >
              <div className="w-full max-w-xs mx-auto">
                <img
                  src={s.image}
                  alt="Veículo"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-foreground rounded-t-[2rem] px-6 pt-8 pb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-background mb-3 leading-tight">
          {slide.title}
        </h2>
        <p className="text-background/70 text-sm mb-8">
          {slide.description}
        </p>

        {/* Dots & Button */}
        <div className="flex items-center justify-between">
          {/* Progress Dots */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-6 bg-primary"
                    : "w-2 bg-background/30"
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          {slide.isLast ? (
            <div className="flex gap-3">
              <Button
                onClick={handleCreateAccount}
                variant="secondary"
                className="bg-background/20 text-background hover:bg-background/30 border-0 px-6"
              >
                Criar Conta
              </Button>
              <Button
                onClick={handleLogin}
                className="px-8"
              >
                Login
              </Button>
            </div>
          ) : (
            <Button onClick={handleNext} className="px-8">
              Continuar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
