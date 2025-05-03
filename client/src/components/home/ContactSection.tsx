import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CONTACT_INFO } from "@/lib/constants";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Form validation schema
const contactFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  projectType: z.string().min(1, "Please select a project type"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const ContactSection = () => {
  const { toast } = useToast();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      projectType: "",
      message: "",
    },
  });

  const submitContactForm = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      return apiRequest('POST', '/api/contact', data);
    },
    onSuccess: () => {
      toast({
        title: "Consultation Request Received",
        description: "Thank you for your interest. We'll be in touch shortly to discuss your project.",
        variant: "default",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: ContactFormValues) {
    submitContactForm.mutate(data);
  }

  return (
    <section id="contact" className="py-24 bg-offwhite text-charcoal">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16">
          <div className="reveal">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-6">
              Begin Your Journey
            </h2>
            <p className="text-lg text-charcoal/80 mb-8">
              Ready to transform your automotive vision into reality? Schedule a consultation with our team to discuss your project.
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium text-charcoal mb-1">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full px-4 py-3 bg-white border border-charcoal/20 focus:border-burgundy focus:outline-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium text-charcoal mb-1">
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full px-4 py-3 bg-white border border-charcoal/20 focus:border-burgundy focus:outline-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-medium text-charcoal mb-1">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          className="w-full px-4 py-3 bg-white border border-charcoal/20 focus:border-burgundy focus:outline-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-medium text-charcoal mb-1">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          className="w-full px-4 py-3 bg-white border border-charcoal/20 focus:border-burgundy focus:outline-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-medium text-charcoal mb-1">
                        Project Type
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full px-4 py-3 bg-white border border-charcoal/20 focus:border-burgundy focus:outline-none">
                            <SelectValue placeholder="Select Project Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="american-muscle">American Muscle</SelectItem>
                          <SelectItem value="european-classic">European Classic</SelectItem>
                          <SelectItem value="truck-4x4">Truck/4x4</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-medium text-charcoal mb-1">
                        Tell Us About Your Project
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={5}
                          className="w-full px-4 py-3 bg-white border border-charcoal/20 focus:border-burgundy focus:outline-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full bg-burgundy hover:bg-burgundy/90 text-white px-6 py-4 text-sm uppercase tracking-wider font-medium transition-all duration-200"
                  disabled={submitContactForm.isPending}
                >
                  {submitContactForm.isPending ? "Submitting..." : "Request Consultation"}
                </Button>
              </form>
            </Form>
          </div>
          
          <div className="reveal">
            <div className="sticky top-24">
              <h3 className="font-playfair text-2xl font-medium mb-6">Visit Our Workshop</h3>
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <img
                  src="https://images.unsplash.com/photo-1597762470488-3877b1f538c6?q=80&w=1600&auto=format&fit=crop"
                  alt="Skinny's Rod and Custom workshop"
                  className="w-full h-64 object-cover rounded-sm shadow-lg"
                />
              </div>
              <div className="mb-8">
                <p className="mb-2 font-medium">Skinny's Rod and Custom</p>
                <address className="not-italic text-charcoal/80">
                  {CONTACT_INFO.address.line1}<br />
                  {CONTACT_INFO.address.line2}<br />
                  <a href={`tel:${CONTACT_INFO.phone}`} className="text-burgundy hover:text-burgundy/80">
                    {CONTACT_INFO.phone}
                  </a><br />
                  <a href={`mailto:${CONTACT_INFO.email}`} className="text-burgundy hover:text-burgundy/80">
                    {CONTACT_INFO.email}
                  </a>
                </address>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Hours of Operation</h4>
                <ul className="text-charcoal/80 space-y-1">
                  {CONTACT_INFO.hours.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.day}</span>
                      <span>{item.hours}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-charcoal/80">
                  Tours available by appointment only
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
