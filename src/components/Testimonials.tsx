import React from 'react';
import { Star } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { reviews } from '@/data/reviews';

const Testimonials = () => {
    return (
        <section id="reviews" className="py-20 bg-white border-t border-muted">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h3 className="text-3xl font-bold text-foreground mb-4">What Parents Are Saying</h3>
                    <p className="text-lg text-muted-foreground mb-8 text-center max-w-3xl mx-auto">
                        Real feedback from parents who trust Aama Daycare with their children
                    </p>

                    {/* Overall Rating Badge */}
                    <div className="inline-flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-100 mb-8">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className="w-5 h-5 text-yellow-500 fill-current" />
                            ))}
                        </div>
                        <span className="font-bold text-yellow-700 ml-2">5.0 Rating on Yelp</span>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full max-w-5xl"
                    >
                        <CarouselContent className="-ml-2 md:-ml-4">
                            {reviews.map((review) => (
                                <CarouselItem key={review.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                    <div className="p-1 h-full">
                                        <Card className="h-full border-none shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] hover:shadow-xl transition-all duration-300">
                                            <CardContent className="flex flex-col p-8 h-full">
                                                <div className="flex items-center gap-1 mb-6">
                                                    {[...Array(review.rating)].map((_, i) => (
                                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                                    ))}
                                                </div>

                                                <blockquote className="flex-grow mb-8 text-muted-foreground leading-relaxed relative">
                                                    {/* Decorative quote mark */}
                                                    <span className="absolute -top-4 -left-2 text-6xl text-primary/10 font-serif leading-none">"</span>
                                                    <span className="relative z-10 text-base">{review.text.length > 180 ? `${review.text.substring(0, 180)}...` : review.text}</span>
                                                    {review.text.length > 180 && (
                                                        <a href="https://www.yelp.com/biz/aama-day-care-san-ramon-2" target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline text-sm font-medium">Read more</a>
                                                    )}
                                                </blockquote>

                                                <div className="flex items-center gap-4 mt-auto pt-4 border-t border-slate-50">
                                                    <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                                                        <AvatarImage src={review.image} alt={review.user} />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                            {review.user.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-bold text-foreground">{review.user}</div>
                                                        <div className="text-xs text-muted-foreground">{review.date}</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex -left-12 bg-white hover:bg-white hover:text-primary border-none shadow-lg text-muted-foreground w-12 h-12" />
                        <CarouselNext className="hidden md:flex -right-12 bg-white hover:bg-white hover:text-primary border-none shadow-lg text-muted-foreground w-12 h-12" />
                    </Carousel>
                </div>

                {/* Call to Action */}
                <div className="text-center mt-12">
                    <a
                        href="https://www.yelp.com/biz/aama-day-care-san-ramon-2"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium border-b border-transparent hover:border-primary pb-0.5"
                    >
                        <span>See more reviews on Yelp</span>
                        <ExternalLink className="w-4 h-4 relative top-[1px]" />
                    </a>
                </div>
            </div>

            {/* Missing import simulation for icon */}
            <style>{`
        /* Since we didn't import ExternalLink inside the component definition string above, 
           we need to make sure it's valid code or fix it in post. 
           Wait, I did not import ExternalLink in the import block.
           Function body uses ExternalLink.
           I must ensure I add the import.
        */
      `}</style>
        </section>
    );
};

// Fix the missing import in the actual file write
import { ExternalLink } from "lucide-react";

export default Testimonials;
